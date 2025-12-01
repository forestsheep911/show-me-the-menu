"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useMenuStore } from "@/store/menuStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  ArrowUpDown,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { matchesSearch } from "@/lib/search";
import { MultiSelect, MultiSelectOption } from "@/components/MultiSelect";
import { EditableCell } from "@/components/EditableCell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  ColumnResizeMode,
  SortingState,
} from "@tanstack/react-table";
import { Dish, Ingredient, IngredientColorName, Tag } from "@/types/menu";

const COLUMN_SIZES_KEY = "dishes-column-sizes";
const SORT_STATE_KEY = "dishes-sort-state";
const FILTER_STATE_KEY = "dishes-filter-state";
const PAGE_SIZE = 25;

// 排序和筛选类型定义
type SortDirection = "asc" | "desc";
interface SortRule {
  id: string;
  field: string;
  direction: SortDirection;
}

type FilterOperator = "contains" | "not_contains" | "is_empty" | "is_not_empty";
interface FilterRule {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
}

// 可排序/筛选的字段配置
const SORTABLE_FIELDS = [
  { id: "name", label: "菜品名称", type: "text" },
  { id: "tags", label: "标签", type: "array" },
  { id: "mainIngredients", label: "主料", type: "array" },
  { id: "subIngredients", label: "辅料", type: "array" },
  { id: "steps", label: "做法步骤", type: "text" },
] as const;

const FILTER_OPERATORS = [
  { id: "contains", label: "包含" },
  { id: "not_contains", label: "不包含" },
  { id: "is_empty", label: "为空" },
  { id: "is_not_empty", label: "不为空" },
] as const;

// localStorage 工具函数
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore errors
  }
}

// 生成唯一 ID
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function DishesManagePage() {
  const {
    dishes,
    tags,
    ingredients,
    addDish,
    removeDish,
    updateDish,
    addIngredient,
    removeIngredient,
    updateIngredient,
    reorderIngredients,
  } = useMenuStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [newDishName, setNewDishName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  // 排序状态
  const [sortRules, setSortRules] = useState<SortRule[]>([]);
  const [sortPopoverOpen, setSortPopoverOpen] = useState(false);

  // 筛选状态
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  // 加载保存的状态
  useEffect(() => {
    setColumnSizing(loadFromStorage(COLUMN_SIZES_KEY, {}));
    setSortRules(loadFromStorage(SORT_STATE_KEY, []));
    setFilterRules(loadFromStorage(FILTER_STATE_KEY, []));
  }, []);

  // 保存列宽
  useEffect(() => {
    if (Object.keys(columnSizing).length > 0) {
      saveToStorage(COLUMN_SIZES_KEY, columnSizing);
    }
  }, [columnSizing]);

  // 保存排序规则
  useEffect(() => {
    saveToStorage(SORT_STATE_KEY, sortRules);
  }, [sortRules]);

  // 保存筛选规则
  useEffect(() => {
    saveToStorage(FILTER_STATE_KEY, filterRules);
  }, [filterRules]);

  // 转换为 tanstack table 的排序格式
  const sorting: SortingState = useMemo(
    () => sortRules.map((rule) => ({ id: rule.field, desc: rule.direction === "desc" })),
    [sortRules]
  );

  // 应用筛选逻辑
  const filteredDishes = useMemo(() => {
    let result = dishes.filter((dish: Dish) => matchesSearch(dish.name, searchTerm));

    // 应用筛选规则
    for (const rule of filterRules) {
      result = result.filter((dish: Dish) => {
        const fieldValue = dish[rule.field as keyof Dish];
        const isArray = Array.isArray(fieldValue);
        const stringValue = isArray ? (fieldValue as string[]).join(" ") : String(fieldValue || "");

        switch (rule.operator) {
          case "contains":
            if (isArray) {
              return (fieldValue as string[]).some((v) =>
                v.toLowerCase().includes(rule.value.toLowerCase())
              );
            }
            return stringValue.toLowerCase().includes(rule.value.toLowerCase());
          case "not_contains":
            if (isArray) {
              return !(fieldValue as string[]).some((v) =>
                v.toLowerCase().includes(rule.value.toLowerCase())
              );
            }
            return !stringValue.toLowerCase().includes(rule.value.toLowerCase());
          case "is_empty":
            return isArray ? (fieldValue as string[]).length === 0 : !stringValue;
          case "is_not_empty":
            return isArray ? (fieldValue as string[]).length > 0 : !!stringValue;
          default:
            return true;
        }
      });
    }

    return result;
  }, [dishes, searchTerm, filterRules]);

  // 只显示 displayCount 条数据
  const displayedDishes = useMemo(
    () => filteredDishes.slice(0, displayCount),
    [filteredDishes, displayCount]
  );

  const hasMore = displayCount < filteredDishes.length;

  // 搜索或筛选变化时重置显示数量
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [searchTerm, filterRules]);

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + PAGE_SIZE);
  };

  // 排序操作
  const addSortRule = useCallback(() => {
    const usedFields = new Set(sortRules.map((r) => r.field));
    const availableField = SORTABLE_FIELDS.find((f) => !usedFields.has(f.id));
    if (availableField) {
      setSortRules((prev) => [
        ...prev,
        { id: generateId(), field: availableField.id, direction: "asc" },
      ]);
    }
  }, [sortRules]);

  const updateSortRule = useCallback((id: string, updates: Partial<SortRule>) => {
    setSortRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule))
    );
  }, []);

  const removeSortRule = useCallback((id: string) => {
    setSortRules((prev) => prev.filter((rule) => rule.id !== id));
  }, []);

  const clearAllSorts = useCallback(() => {
    setSortRules([]);
  }, []);

  // 筛选操作
  const addFilterRule = useCallback(() => {
    setFilterRules((prev) => [
      ...prev,
      { id: generateId(), field: "name", operator: "contains", value: "" },
    ]);
  }, []);

  const updateFilterRule = useCallback((id: string, updates: Partial<FilterRule>) => {
    setFilterRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule))
    );
  }, []);

  const removeFilterRule = useCallback((id: string) => {
    setFilterRules((prev) => prev.filter((rule) => rule.id !== id));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilterRules([]);
  }, []);

  // Convert ingredients to MultiSelectOption format
  const ingredientOptions: MultiSelectOption[] = useMemo(
    () => ingredients.map((i: Ingredient) => ({ name: i.name, color: i.color as IngredientColorName })),
    [ingredients]
  );

  // Convert tags to MultiSelectOption format
  const tagOptions: MultiSelectOption[] = useMemo(
    () => tags.map((t: Tag) => ({ name: t.name, color: "default" as IngredientColorName })),
    [tags]
  );

  const handleAddDish = () => {
    if (!newDishName.trim()) return;
    addDish(newDishName.trim());
    setNewDishName("");
  };

  // 自定义数组字段排序函数
  const arraySort = (rowA: Dish, rowB: Dish, field: keyof Dish) => {
    const a = (rowA[field] as string[]) || [];
    const b = (rowB[field] as string[]) || [];
    const aStr = a.join(",");
    const bStr = b.join(",");
    return aStr.localeCompare(bStr, "zh-CN");
  };

  const columns: ColumnDef<Dish>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        size: 50,
        minSize: 40,
        maxSize: 60,
        enableResizing: false,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-gray-400 font-mono text-xs">{row.index + 1}</span>
        ),
      },
      {
        accessorKey: "name",
        header: "菜品名称",
        size: 150,
        minSize: 100,
        sortingFn: (rowA, rowB) =>
          rowA.original.name.localeCompare(rowB.original.name, "zh-CN"),
        cell: ({ row }) => (
          <EditableCell
            value={row.original.name}
            onChange={(value) => updateDish(row.original.name, { name: value })}
            className="font-medium text-gray-700"
          />
        ),
      },
      {
        accessorKey: "tags",
        header: "标签",
        size: 200,
        minSize: 120,
        sortingFn: (rowA, rowB) => arraySort(rowA.original, rowB.original, "tags"),
        cell: ({ row }) => (
          <MultiSelect
            options={tagOptions}
            selected={row.original.tags}
            onChange={(selected) => updateDish(row.original.name, { tags: selected })}
            placeholder="添加标签..."
            className="min-w-[100px]"
          />
        ),
      },
      {
        accessorKey: "mainIngredients",
        header: "主料",
        size: 200,
        minSize: 120,
        sortingFn: (rowA, rowB) => arraySort(rowA.original, rowB.original, "mainIngredients"),
        cell: ({ row }) => (
          <MultiSelect
            options={ingredientOptions}
            selected={row.original.mainIngredients}
            onChange={(selected) => updateDish(row.original.name, { mainIngredients: selected })}
            onCreateOption={(name, color) => addIngredient(name, color)}
            onDeleteOption={removeIngredient}
            onUpdateOption={updateIngredient}
            onReorderOptions={reorderIngredients}
            placeholder="添加主料..."
            className="min-w-[100px]"
          />
        ),
      },
      {
        accessorKey: "subIngredients",
        header: "辅料",
        size: 200,
        minSize: 120,
        sortingFn: (rowA, rowB) => arraySort(rowA.original, rowB.original, "subIngredients"),
        cell: ({ row }) => (
          <MultiSelect
            options={ingredientOptions}
            selected={row.original.subIngredients}
            onChange={(selected) => updateDish(row.original.name, { subIngredients: selected })}
            onCreateOption={(name, color) => addIngredient(name, color)}
            onDeleteOption={removeIngredient}
            onUpdateOption={updateIngredient}
            onReorderOptions={reorderIngredients}
            placeholder="添加辅料..."
            className="min-w-[100px]"
          />
        ),
      },
      {
        accessorKey: "steps",
        header: "做法步骤",
        size: 300,
        minSize: 150,
        sortingFn: (rowA, rowB) =>
          (rowA.original.steps || "").localeCompare(rowB.original.steps || "", "zh-CN"),
        cell: ({ row }) => (
          <EditableCell
            value={row.original.steps}
            onChange={(value) => updateDish(row.original.name, { steps: value })}
            multiline
            placeholder="添加做法步骤..."
            className="text-gray-600 text-sm"
          />
        ),
      },
      {
        id: "actions",
        header: "操作",
        size: 80,
        minSize: 60,
        maxSize: 100,
        enableResizing: false,
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteConfirm(row.original.name)}
            className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
            title="删除"
          >
            <Trash2 className="size-4" />
          </Button>
        ),
      },
    ],
    [
      tagOptions,
      ingredientOptions,
      updateDish,
      addIngredient,
      removeIngredient,
      updateIngredient,
      reorderIngredients,
    ]
  );

  const table = useReactTable({
    data: displayedDishes,
    columns,
    columnResizeMode: "onChange" as ColumnResizeMode,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnSizing,
      sorting,
    },
    onColumnSizingChange: setColumnSizing,
    enableSorting: true,
    manualSorting: false,
  });

  // 获取字段标签
  const getFieldLabel = (fieldId: string) =>
    SORTABLE_FIELDS.find((f) => f.id === fieldId)?.label || fieldId;

  return (
    <main className="flex flex-col w-full min-h-screen bg-gray-50/50">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/edit">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">菜品管理</h1>
              <p className="text-xs text-gray-500">管理菜品、食材和做法步骤</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Search, Sort, Filter and Add */}
        <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Search and Sort/Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                <input
                  type="text"
                  placeholder="搜索菜品..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Sort Button */}
              <Popover open={sortPopoverOpen} onOpenChange={setSortPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={sortRules.length > 0 ? "secondary" : "outline"}
                    size="sm"
                    className="gap-1.5"
                  >
                    <ArrowUpDown className="size-3.5" />
                    排序
                    {sortRules.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                        {sortRules.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3" align="start">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">排序规则</span>
                      {sortRules.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllSorts}
                          className="h-7 text-xs text-gray-500 hover:text-gray-700"
                        >
                          清除全部
                        </Button>
                      )}
                    </div>

                    {sortRules.length === 0 ? (
                      <p className="text-sm text-gray-500 py-2">暂无排序规则</p>
                    ) : (
                      <div className="space-y-2">
                        {sortRules.map((rule, index) => (
                          <div
                            key={rule.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                          >
                            <GripVertical className="size-4 text-gray-400 flex-shrink-0" />
                            <Select
                              value={rule.field}
                              onValueChange={(value) => updateSortRule(rule.id, { field: value })}
                            >
                              <SelectTrigger className="h-8 flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {SORTABLE_FIELDS.map((field) => (
                                  <SelectItem
                                    key={field.id}
                                    value={field.id}
                                    disabled={sortRules.some(
                                      (r) => r.field === field.id && r.id !== rule.id
                                    )}
                                  >
                                    {field.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() =>
                                updateSortRule(rule.id, {
                                  direction: rule.direction === "asc" ? "desc" : "asc",
                                })
                              }
                            >
                              {rule.direction === "asc" ? (
                                <ChevronUp className="size-4" />
                              ) : (
                                <ChevronDown className="size-4" />
                              )}
                              <span className="ml-1 text-xs">
                                {rule.direction === "asc" ? "升序" : "降序"}
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                              onClick={() => removeSortRule(rule.id)}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {sortRules.length < SORTABLE_FIELDS.length && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addSortRule}
                        className="w-full gap-1.5"
                      >
                        <Plus className="size-3.5" />
                        添加排序
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Filter Button */}
              <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={filterRules.length > 0 ? "secondary" : "outline"}
                    size="sm"
                    className="gap-1.5"
                  >
                    <Filter className="size-3.5" />
                    筛选
                    {filterRules.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                        {filterRules.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-3" align="start">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">筛选条件</span>
                      {filterRules.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="h-7 text-xs text-gray-500 hover:text-gray-700"
                        >
                          清除全部
                        </Button>
                      )}
                    </div>

                    {filterRules.length === 0 ? (
                      <p className="text-sm text-gray-500 py-2">暂无筛选条件</p>
                    ) : (
                      <div className="space-y-2">
                        {filterRules.map((rule) => (
                          <div key={rule.id} className="p-2 bg-gray-50 rounded-md space-y-2">
                            <div className="flex items-center gap-2">
                              <Select
                                value={rule.field}
                                onValueChange={(value) => updateFilterRule(rule.id, { field: value })}
                              >
                                <SelectTrigger className="h-8 flex-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SORTABLE_FIELDS.map((field) => (
                                    <SelectItem key={field.id} value={field.id}>
                                      {field.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={rule.operator}
                                onValueChange={(value) =>
                                  updateFilterRule(rule.id, { operator: value as FilterOperator })
                                }
                              >
                                <SelectTrigger className="h-8 w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FILTER_OPERATORS.map((op) => (
                                    <SelectItem key={op.id} value={op.id}>
                                      {op.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                                onClick={() => removeFilterRule(rule.id)}
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                            {(rule.operator === "contains" || rule.operator === "not_contains") && (
                              <input
                                type="text"
                                placeholder="输入筛选值..."
                                value={rule.value}
                                onChange={(e) =>
                                  updateFilterRule(rule.id, { value: e.target.value })
                                }
                                className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addFilterRule}
                      className="w-full gap-1.5"
                    >
                      <Plus className="size-3.5" />
                      添加筛选
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Add Dish */}
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="新菜品名称"
                value={newDishName}
                onChange={(e) => setNewDishName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddDish();
                }}
                className="flex-1 sm:w-64 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button onClick={handleAddDish} disabled={!newDishName.trim()}>
                <Plus className="size-4 mr-2" />
                添加菜品
              </Button>
            </div>
          </div>

          {/* Active Sort/Filter Badges */}
          {(sortRules.length > 0 || filterRules.length > 0) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {sortRules.map((rule) => (
                <Badge
                  key={rule.id}
                  variant="secondary"
                  className="gap-1 pr-1 cursor-pointer hover:bg-gray-200"
                  onClick={() => setSortPopoverOpen(true)}
                >
                  {rule.direction === "asc" ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )}
                  {getFieldLabel(rule.field)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-gray-300 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSortRule(rule.id);
                    }}
                  >
                    <X className="size-3" />
                  </Button>
                </Badge>
              ))}
              {filterRules.map((rule) => (
                <Badge
                  key={rule.id}
                  variant="outline"
                  className="gap-1 pr-1 cursor-pointer hover:bg-gray-100"
                  onClick={() => setFilterPopoverOpen(true)}
                >
                  <Filter className="size-3" />
                  {getFieldLabel(rule.field)}{" "}
                  {FILTER_OPERATORS.find((op) => op.id === rule.operator)?.label}
                  {rule.value && `: ${rule.value}`}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-gray-200 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFilterRule(rule.id);
                    }}
                  >
                    <X className="size-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table
              className="w-full text-left text-sm"
              style={{ width: table.getCenterTotalSize() }}
            >
              <thead className="bg-gray-50 border-b text-gray-500">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-3 py-3 font-medium relative select-none"
                        style={{ width: header.getSize() }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {/* Resize handle */}
                        {header.column.getCanResize() && (
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={cn(
                              "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
                              "hover:bg-blue-400",
                              header.column.getIsResizing() && "bg-blue-500"
                            )}
                          />
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                      {searchTerm || filterRules.length > 0
                        ? "未找到匹配的菜品"
                        : "暂无菜品，请添加"}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-3 py-2 align-top"
                          style={{
                            width: cell.column.getSize(),
                            maxWidth: cell.column.getSize(),
                          }}
                        >
                          <div className="break-words">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* 加载更多按钮 */}
          {hasMore && (
            <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-center">
              <Button variant="outline" onClick={handleLoadMore} className="text-sm">
                加载更多（还有 {filteredDishes.length - displayCount} 条）
              </Button>
            </div>
          )}
          <div className="px-6 py-4 border-t bg-gray-50 text-xs text-gray-400 flex justify-between items-center">
            <span>
              {searchTerm || filterRules.length > 0 ? (
                <>
                  显示 {displayedDishes.length} / {filteredDishes.length} 道菜（共 {dishes.length}{" "}
                  道）
                </>
              ) : (
                <>
                  显示 {displayedDishes.length} / {dishes.length} 道菜
                </>
              )}
            </span>
            <span>提示：拖动列边缘调整宽度，点击单元格可编辑</span>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除「{deleteConfirm}」吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  removeDish(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
