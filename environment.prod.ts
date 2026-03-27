import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  createdAt: number;
  editedAt: number;
  favorite: boolean;
}

interface Flashcard {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class HomePage implements OnInit {

  // ── NAVIGATION ────────────────────────────────────────────
  currentView: 'home' | 'new' | 'notes' | 'premium' | 'flashcards' = 'home';

  // ── NEW NOTE FIELDS ────────────────────────────────────────
  newNoteTitle   = '';
  newNoteContent = '';
  newNoteFolder  = 'General';
  editingNote: Note | null = null;

  // ── NOTES LIST ─────────────────────────────────────────────
  notes: Note[] = [];
  searchQuery   = '';
  activeTab     = 'all';
  sortMode      = 'edited';

  // ── FOLDERS ────────────────────────────────────────────────
  folders: string[]  = [];
  newFolderName      = '';

  // ── FLASHCARDS ─────────────────────────────────────────────
  activeFlashcards: Flashcard[] = [];
  currentCardIndex = 0;
  cardFlipped      = false;

  // ── PREMIUM ────────────────────────────────────────────────
  benefits = [
    'Unlimited flashcards',
    'Custom flashcard designs with images',
    'Advanced hints and explanations',
    'Multiplayer study sessions',
    'Streak bonuses and rewards',
    'No ads, ever',
  ];

  // ── TOAST ──────────────────────────────────────────────────
  toastMessage = '';
  private toastTimer: any;

  // ─────────────────────────────────────────────────────────
  ngOnInit() {
    this.loadFromStorage();
  }

  // ── NAVIGATION ────────────────────────────────────────────
  setView(view: 'home' | 'new' | 'notes' | 'premium' | 'flashcards') {
    this.currentView = view;
  }

  goHome() {
    this.currentView = 'home';
    this.editingNote = null;
    this.resetNewNote();
  }

  // ── NEW NOTE ──────────────────────────────────────────────
  openNewNote() {
    this.editingNote = null;
    this.resetNewNote();
    this.currentView = 'new';
  }

  closeNewNote() {
    this.editingNote = null;
    this.resetNewNote();
    this.currentView = 'home';
  }

  resetNewNote() {
    this.newNoteTitle   = '';
    this.newNoteContent = '';
    this.newNoteFolder  = 'General';
  }

  saveNote() {
    const title = this.newNoteTitle.trim() || 'Untitled Note';

    if (this.editingNote) {
      const idx = this.notes.findIndex(n => n.id === this.editingNote!.id);
      if (idx !== -1) {
        this.notes[idx] = {
          ...this.notes[idx],
          title,
          content: this.newNoteContent,
          folder:  this.newNoteFolder,
          editedAt: Date.now(),
        };
      }
      this.editingNote = null;
    } else {
      const note: Note = {
        id:        Date.now().toString(),
        title,
        content:   this.newNoteContent,
        folder:    this.newNoteFolder,
        createdAt: Date.now(),
        editedAt:  Date.now(),
        favorite:  false,
      };
      this.notes.unshift(note);
    }

    this.saveToStorage();
    this.showToast('Note saved!');
    this.resetNewNote();
    this.currentView = 'notes';
  }

  convertNote() {
    const cards = this.parseFlashcards(this.newNoteContent);
    if (cards.length === 0) {
      this.showToast('No flashcard pairs found. Use "Answer – Question" format.');
      return;
    }
    // Auto-save first
    const title = this.newNoteTitle.trim() || 'Untitled Note';
    if (this.editingNote) {
      const idx = this.notes.findIndex(n => n.id === this.editingNote!.id);
      if (idx !== -1) {
        this.notes[idx] = {
          ...this.notes[idx],
          title,
          content:  this.newNoteContent,
          editedAt: Date.now(),
        };
      }
    } else {
      this.notes.unshift({
        id:        Date.now().toString(),
        title,
        content:   this.newNoteContent,
        folder:    this.newNoteFolder,
        createdAt: Date.now(),
        editedAt:  Date.now(),
        favorite:  false,
      });
    }
    this.saveToStorage();
    this.activeFlashcards = cards;
    this.currentCardIndex = 0;
    this.cardFlipped = false;
    this.resetNewNote();
    this.editingNote = null;
    this.currentView = 'flashcards';
  }

  // ── NOTES ─────────────────────────────────────────────────
  editNote(note: Note) {
    this.editingNote   = note;
    this.newNoteTitle   = note.title;
    this.newNoteContent = note.content;
    this.newNoteFolder  = note.folder;
    this.currentView = 'new';
  }

  deleteNote(id: string) {
    this.notes = this.notes.filter(n => n.id !== id);
    this.saveToStorage();
    this.showToast('Note deleted.');
  }

  viewFlashcards(note: Note) {
    const cards = this.parseFlashcards(note.content);
    this.activeFlashcards = cards;
    this.currentCardIndex = 0;
    this.cardFlipped = false;
    this.currentView = 'flashcards';
  }

  get filteredNotes(): Note[] {
    let result = [...this.notes];

    // Tab filter
    if (this.activeTab === 'favorites') {
      result = result.filter(n => n.favorite);
    } else if (this.activeTab !== 'all') {
      result = result.filter(n => n.folder === this.activeTab);
    }

    // Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    }

    // Sort
    if (this.sortMode === 'az') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.sortMode === 'created') {
      result.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      result.sort((a, b) => b.editedAt - a.editedAt);
    }

    return result;
  }

  sortBy(mode: string) {
    this.sortMode = mode;
  }

  // ── FOLDERS ───────────────────────────────────────────────
  addFolder() {
    const name = this.newFolderName.trim();
    if (!name || this.folders.includes(name) || name === 'General') return;
    this.folders.push(name);
    this.newFolderName = '';
    this.saveToStorage();
  }

  // ── FLASHCARDS ────────────────────────────────────────────
  parseFlashcards(content: string): Flashcard[] {
    const lines = content.split('\n').filter(l => l.trim());
    const cards: Flashcard[] = [];
    const separators = [' – ', ' - ', ' — ', ': '];

    for (const line of lines) {
      for (const sep of separators) {
        const idx = line.indexOf(sep);
        if (idx !== -1) {
          const answer = line.substring(0, idx).trim();
          const question = line.substring(idx + sep.length).trim();
          if (answer && question) {
            cards.push({ answer, question });
            break;
          }
        }
      }
    }
    return cards;
  }

  flipCard() {
    this.cardFlipped = !this.cardFlipped;
  }

  nextCard() {
    if (this.currentCardIndex < this.activeFlashcards.length - 1) {
      this.cardFlipped = false;
      setTimeout(() => this.currentCardIndex++, 50);
    }
  }

  prevCard() {
    if (this.currentCardIndex > 0) {
      this.cardFlipped = false;
      setTimeout(() => this.currentCardIndex--, 50);
    }
  }

  // ── STORAGE ───────────────────────────────────────────────
  saveToStorage() {
    localStorage.setItem('brainflip_notes',   JSON.stringify(this.notes));
    localStorage.setItem('brainflip_folders', JSON.stringify(this.folders));
  }

  loadFromStorage() {
    const raw = localStorage.getItem('brainflip_notes');
    if (raw) {
      try { this.notes = JSON.parse(raw); } catch { this.notes = []; }
    }
    const rawF = localStorage.getItem('brainflip_folders');
    if (rawF) {
      try { this.folders = JSON.parse(rawF); } catch { this.folders = []; }
    }
  }

  // ── TOAST ─────────────────────────────────────────────────
  showToast(msg: string) {
    clearTimeout(this.toastTimer);
    this.toastMessage = msg;
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
    }, 2600);
  }
}