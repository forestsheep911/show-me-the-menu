"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useMenuStore } from "@/store/menuStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { matchesSearch } from "@/lib/search";
import { TagSelector } from "@/components/TagSelector";
import { IngredientPickerModal } from "@/components/IngredientPickerModal";
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
  flexRender,
  ColumnDef,
  ColumnResizeMode,
} from "@tanstack/react-table";
import { Dish, Ingredient, INGREDIENT_COLORS } from "@/types/menu";

const COLUMN_SIZES_KEY = "dishes-column-sizes";

// Load column sizes from localStorage
function loadColumnSizes(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(COLUMN_SIZES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

// Save column sizes to localStorage
function saveColumnSizes(sizes: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COLUMN_SIZES_KEY, JSON.stringify(sizes));
  } catch {
    // Ignore errors
  }
}

// Ingredient display component (shows selected chips and opens modal)
function IngredientCell({
  selected,
  ingredients,
  onChange,
  onCreateIngredient,
  type,
  placeholder,
}: {
  selected: string[];
  ingredients: Ingredient[];
  onChange: (selected: string[]) => void;
  onCreateIngredient: (name: string, bgColor: string, textColor: string, type: 'main' | 'sub') => void;
  type: 'main' | 'sub';
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full min-h-[32px] px-2 py-1 border rounded-md bg-white text-left",
          "hover:border-gray-400 transition-colors",
          "flex flex-wrap items-center gap-1"
        )}
      >
        {selected.length > 0 ? (
          selected.map((name) => {
            const ing = ingredients.find((i) => i.name === name);
            return (
              <span
                key={name}
                className="inline-flex items-center px-1.5 py-0.5 text-xs rounded-sm"
                style={{
                  backgroundColor: ing?.bgColor || INGREDIENT_COLORS.default.bg,
                  color: ing?.textColor || INGREDIENT_COLORS.default.text
                }}
              >
                {name}
              </span>
            );
          })
        ) : (
          <span className="text-sm text-gray-400 flex items-center gap-1">
            {placeholder}
            <ChevronRight className="size-3" />
          </span>
        )}
      </button>

      <IngredientPickerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={type === 'main' ? '选择主料' : '选择辅料'}
        ingredients={ingredients}
        selected={selected}
        onChange={onChange}
        onCreateIngredient={onCreateIngredient}
        ingredientType={type}
      />
    </>
  );
}

export default function DishesManagePage() {
  const {
    dishes,
    tags,
    ingredients,
    addDish,
    removeDish,
    updateDish,
    addTag,
    removeTag,
    updateTag,
    addIngredient,
  } = useMenuStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [newDishName, setNewDishName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});

  // Load saved column sizes on mount
  useEffect(() => {
    setColumnSizing(loadColumnSizes());
  }, []);

  // Save column sizes when they change
  useEffect(() => {
    if (Object.keys(columnSizing).length > 0) {
      saveColumnSizes(columnSizing);
    }
  }, [columnSizing]);

  const filteredDishes = useMemo(() =>
    dishes.filter((dish: Dish) => matchesSearch(dish.name, searchTerm)),
    [dishes, searchTerm]
  );

  const handleAddDish = () => {
    if (!newDishName.trim()) return;
    addDish(newDishName.trim());
    setNewDishName("");
  };

  const columns: ColumnDef<Dish>[] = useMemo(() => [
    {
      id: "index",
      header: "#",
      size: 50,
      minSize: 40,
      maxSize: 60,
      enableResizing: false,
      cell: ({ row }) => (
        <span className="text-gray-400 font-mono text-xs">
          {row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "菜品名称",
      size: 150,
      minSize: 100,
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
      cell: ({ row }) => (
        <TagSelector
          tags={tags}
          selected={row.original.tags}
          onChange={(selected) => updateDish(row.original.name, { tags: selected })}
          onCreateTag={addTag}
          onDeleteTag={removeTag}
          onUpdateTag={updateTag}
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
      cell: ({ row }) => (
        <IngredientCell
          selected={row.original.mainIngredients}
          ingredients={ingredients}
          onChange={(selected) => updateDish(row.original.name, { mainIngredients: selected })}
          onCreateIngredient={addIngredient}
          type="main"
          placeholder="选择主料..."
        />
      ),
    },
    {
      accessorKey: "subIngredients",
      header: "辅料",
      size: 200,
      minSize: 120,
      cell: ({ row }) => (
        <IngredientCell
          selected={row.original.subIngredients}
          ingredients={ingredients}
          onChange={(selected) => updateDish(row.original.name, { subIngredients: selected })}
          onCreateIngredient={addIngredient}
          type="sub"
          placeholder="选择辅料..."
        />
      ),
    },
    {
      accessorKey: "steps",
      header: "做法步骤",
      size: 300,
      minSize: 150,
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
  ], [tags, ingredients, updateDish, addTag, removeTag, updateTag, addIngredient]);

  const table = useReactTable({
    data: filteredDishes,
    columns,
    columnResizeMode: "onChange" as ColumnResizeMode,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnSizing,
    },
    onColumnSizingChange: setColumnSizing,
  });

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
        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
            <input
              type="text"
              placeholder="搜索菜品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
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
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                    <td
                      colSpan={columns.length}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      {searchTerm ? "未找到匹配的菜品" : "暂无菜品，请添加"}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
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
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t bg-gray-50 text-xs text-gray-400 flex justify-between items-center">
            <span>总计 {dishes.length} 道菜</span>
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
