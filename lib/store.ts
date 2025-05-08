import { create } from 'zustand';

interface Link {
  id: string;
  url: string;
  title: string | null;
  category: string | null;
  createdAt: string;
}

interface LinkStore {
  links: Link[];
  addLink: (link: Link) => void;
  setLinks: (links: Link[]) => void;
}

export const useLinkStore = create<LinkStore>((set) => ({
  links: [],
  addLink: (link) => set((state) => ({ links: [link, ...state.links] })),
  setLinks: (links) => set({ links }),
})); 