"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Check, X, Tag } from "lucide-react";
import { useMenuStore } from "@/store/menuStore";
import { Button } from "@/components/ui/button";
import { FormEvent, useState, useCallback } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { Dish } from "@/types/menu";

export default function TagsManagePage() {
  const { dishes, tags, addTag, removeTag, updateTag } = useMenuStore();
  const [newTag, setNewTag] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6b7280");
  const [selectedTagName, setSelectedTagName] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState("");

  // 选中标签进行编辑
  const handleSelectTag = useCallback((tagName: string, tagColor: string) => {
    if (selectedTagName === tagName) {
      setSelectedTagName(null);
      setEditingName("");
      setEditingColor("");
    } else {
      setSelectedTagName(tagName);
      setEditingName(tagName);
      setEditingColor(tagColor);
    }
  }, [selectedTagName]);

  // 添加新标签
  const handleAddTag = (event: FormEvent) => {
    event.preventDefault();
    if (!newTag.trim()) return;
    addTag(newTag.trim(), newTagColor);
    setNewTag("");
    setNewTagColor("#6b7280");
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!selectedTagName || !editingName.trim()) return;
    updateTag(selectedTagName, { name: editingName.trim(), color: editingColor });
    setSelectedTagName(editingName.trim());
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setSelectedTagName(null);
    setEditingName("");
    setEditingColor("");
  };

  // 删除标签
  const handleDeleteTag = () => {
    if (!selectedTagName) return;
    removeTag(selectedTagName);
    setSelectedTagName(null);
    setEditingName("");
    setEditingColor("");
  };

  // 获取选中标签的使用次数
  const getTagUsageCount = (tagName: string) => {
    return dishes.filter((dish: Dish) => dish.tags.includes(tagName)).length;
  };

  return (
    <main className="flex flex-col w-full min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b p-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/edit">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold text-gray-800">标签管理</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">
        {/* 标签列表 */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 pl-1">
            所有标签 ({tags.length})
          </h2>
          <div className="bg-white rounded-xl border shadow-sm p-6">
            {tags.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">暂无标签，请在下方添加。</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {Array.isArray(tags) && tags.map((tag) => {
                  const tagName = typeof tag === "string" ? tag : tag.name;
                  const tagColor = typeof tag === "string" ? "#6b7280" : tag.color;
                  const count = getTagUsageCount(tagName);
                  const isSelected = selectedTagName === tagName;

                  return (
                    <button
                      key={tagName}
                      type="button"
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium
                        transition-all cursor-pointer
                        ${isSelected 
                          ? "ring-2 ring-offset-2 ring-gray-900 scale-105" 
                          : "hover:scale-105 hover:shadow-md"
                        }
                      `}
                      style={{ backgroundColor: tagColor }}
                      onClick={() => handleSelectTag(tagName, tagColor)}
                    >
                      {tagName}
                      <span className="text-xs opacity-80 bg-black/20 px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 编辑区域 */}
        {selectedTagName && (
          <section className="animate-in fade-in slide-in-from-top-2 duration-300">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 pl-1">
              编辑标签
            </h2>
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-6">
              {/* 预览 */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">预览：</span>
                <span
                  className="px-4 py-2 rounded-full text-white text-sm font-medium"
                  style={{ backgroundColor: editingColor }}
                >
                  {editingName || "标签名称"}
                </span>
              </div>

              {/* 名称编辑 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签名称
                </label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#ff7043] focus:outline-none focus:ring-2 focus:ring-[#ffcc80]/50"
                  placeholder="输入标签名称"
                />
              </div>

              {/* 颜色选择器 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  标签颜色
                </label>
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* 颜色选择器 */}
                  <div className="color-picker-wrapper">
                    <HexColorPicker color={editingColor} onChange={setEditingColor} />
                  </div>
                  
                  {/* 颜色信息 */}
                  <div className="flex-1 space-y-4">
                    {/* HEX 输入 */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">HEX 颜色值</label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">#</span>
                        <HexColorInput
                          color={editingColor}
                          onChange={setEditingColor}
                          className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm font-mono uppercase focus:border-[#ff7043] focus:outline-none focus:ring-2 focus:ring-[#ffcc80]/50"
                        />
                      </div>
                    </div>

                    {/* 当前颜色预览 */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">当前颜色</label>
                      <div
                        className="w-full h-12 rounded-lg border border-gray-200"
                        style={{ backgroundColor: editingColor }}
                      />
                    </div>

                    {/* 使用统计 */}
                    <div className="text-sm text-gray-500">
                      此标签被 <span className="font-bold text-gray-700">{getTagUsageCount(selectedTagName)}</span> 道菜使用
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={handleDeleteTag}
                >
                  <Trash2 className="size-4 mr-2" />
                  删除标签
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="size-4 mr-2" />
                    取消
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={!editingName.trim()}>
                    <Check className="size-4 mr-2" />
                    保存修改
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 添加新标签 */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 pl-1">
            添加新标签
          </h2>
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <form onSubmit={handleAddTag} className="space-y-6">
              {/* 预览 */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">预览：</span>
                <span
                  className="px-4 py-2 rounded-full text-white text-sm font-medium"
                  style={{ backgroundColor: newTagColor }}
                >
                  {newTag || "新标签"}
                </span>
              </div>

              {/* 名称输入 */}
              <div>
                <label htmlFor="new-tag" className="block text-sm font-medium text-gray-700 mb-2">
                  标签名称
                </label>
                <input
                  id="new-tag"
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#ff7043] focus:outline-none focus:ring-2 focus:ring-[#ffcc80]/50"
                  placeholder="例如：低脂、无辣、儿童餐"
                />
              </div>

              {/* 颜色选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  标签颜色
                </label>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="color-picker-wrapper">
                    <HexColorPicker color={newTagColor} onChange={setNewTagColor} />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">HEX 颜色值</label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">#</span>
                        <HexColorInput
                          color={newTagColor}
                          onChange={setNewTagColor}
                          className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm font-mono uppercase focus:border-[#ff7043] focus:outline-none focus:ring-2 focus:ring-[#ffcc80]/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">当前颜色</label>
                      <div
                        className="w-full h-12 rounded-lg border border-gray-200"
                        style={{ backgroundColor: newTagColor }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 提交按钮 */}
              <Button type="submit" className="w-full" disabled={!newTag.trim()}>
                <Plus className="size-4 mr-2" />
                添加标签
              </Button>
            </form>
          </div>
        </section>
      </div>

      {/* 颜色选择器样式 */}
      <style jsx global>{`
        .color-picker-wrapper .react-colorful {
          width: 200px;
          height: 200px;
        }
        .color-picker-wrapper .react-colorful__saturation {
          border-radius: 8px 8px 0 0;
        }
        .color-picker-wrapper .react-colorful__hue {
          height: 24px;
          border-radius: 0 0 8px 8px;
        }
        .color-picker-wrapper .react-colorful__saturation-pointer,
        .color-picker-wrapper .react-colorful__hue-pointer {
          width: 20px;
          height: 20px;
          border-width: 3px;
        }
      `}</style>
    </main>
  );
}


