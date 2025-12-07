"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useMenuStore } from "@/store/menuStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Search } from "lucide-react";
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
  flexRender,
  ColumnDef,
  ColumnResizeMode,
} from "@tanstack/react-table";
import { Dish, Ingredient, IngredientColorName, Tag } from "@/types/menu";

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

  // Convert ingredients to MultiSelectOption format
  const ingredientOptions: MultiSelectOption[] = useMemo(() => 
    ingredients.map((i: Ingredient) => ({ name: i.name, color: i.color as IngredientColorName })),
    [ingredients]
  );

  // Convert tags to MultiSelectOption format
  const tagOptions: MultiSelectOption[] = useMemo(() => 
    tags.map((t: Tag) => ({ name: t.name, color: "default" as IngredientColorName })),
    [tags]
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
  ], [tagOptions, ingredientOptions, updateDish, addIngredient, removeIngredient, updateIngredient, reorderIngredients]);

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
