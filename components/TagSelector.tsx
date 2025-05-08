'use client';

import { useEffect, useState } from 'react';

interface Tag {
  id: string;
  name: string;
  parentId: string | null;
  children: Tag[];
  parent: Tag | null;
}

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tagIds: string[]) => void;
}

export default function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleCreateTag = async () => {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTagName,
          parentId: selectedParentId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create tag');
      const newTag = await response.json();
      setTags([...tags, newTag]);
      setNewTagName('');
      setSelectedParentId(null);
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const handleTagSelect = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    onChange(newSelectedTags);
  };

  const renderTagHierarchy = (tagsToRender: Tag[], level: number = 0) => {
    return tagsToRender
      .filter(tag => !tag.parentId)
      .map(tag => (
        <div key={tag.id} style={{ marginLeft: `${level * 20}px` }}>
          <label className="flex items-center space-x-2 py-1">
            <input
              type="checkbox"
              checked={selectedTags.includes(tag.id)}
              onChange={() => handleTagSelect(tag.id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>{tag.name}</span>
          </label>
          {tag.children.length > 0 && renderTagHierarchy(tag.children, level + 1)}
        </div>
      ));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={selectedParentId || ''}
            onChange={(e) => setSelectedParentId(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No parent</option>
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
          <button
            onClick={handleCreateTag}
            disabled={!newTagName}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Add Tag
          </button>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-gray-700 mb-2">Select Tags</h3>
        {renderTagHierarchy(tags)}
      </div>
    </div>
  );
} 