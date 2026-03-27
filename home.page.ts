<ion-content [fullscreen]="true" class="app-content">
  <div class="phone-wrapper">

    <!-- HEADER -->
    <div class="app-header">
      <div class="header-logo">
        <ion-icon name="flash" class="logo-icon"></ion-icon>
        <span class="logo-text">BrainFlip</span>
      </div>
      <button *ngIf="currentView !== 'home'" class="home-btn" (click)="goHome()">Home</button>
    </div>

    <!-- ==================== HOME VIEW ==================== -->
    <div *ngIf="currentView === 'home'" class="view-container home-view">
      <div class="welcome-section">
        <h1 class="welcome-title">Welcome!</h1>
        <p class="welcome-subtitle">Transform your notes into flashcards</p>
      </div>

      <div class="menu-cards">
        <button class="menu-card card-purple" (click)="setView('new')">
          <ion-icon name="document-text-outline" class="card-icon"></ion-icon>
          <div class="card-text">
            <span class="card-title">New Note</span>
            <span class="card-sub">Start writing</span>
          </div>
        </button>

        <button class="menu-card card-gray" (click)="setView('notes')">
          <ion-icon name="folder-outline" class="card-icon"></ion-icon>
          <div class="card-text">
            <span class="card-title">My Notes</span>
            <span class="card-sub">View all notes</span>
          </div>
        </button>

        <button class="menu-card card-orange" (click)="setView('premium')">
          <ion-icon name="people-outline" class="card-icon"></ion-icon>
          <div class="card-text">
            <span class="card-title">Premium Features</span>
            <span class="card-sub">Multiplayer &amp; more</span>
          </div>
          <ion-icon name="person-add-outline" class="card-badge-icon"></ion-icon>
        </button>
      </div>

      <p class="free-label">Free: Up to 20 flashcards per note</p>
    </div>

    <!-- ==================== NEW NOTE VIEW ==================== -->
    <div *ngIf="currentView === 'new'" class="view-container new-view">
      <div class="note-topbar">
        <button class="icon-btn" (click)="closeNewNote()">
          <ion-icon name="close"></ion-icon>
        </button>
        <div class="note-actions">
          <button class="action-btn btn-convert" (click)="convertNote()">
            <ion-icon name="flash-outline"></ion-icon> Convert
          </button>
          <button class="action-btn btn-save" (click)="saveNote()">
            <ion-icon name="save-outline"></ion-icon> Save
          </button>
        </div>
      </div>

      <div class="note-form">
        <div class="form-group" *ngIf="!editingNote">
          <label>Folder</label>
          <div class="select-wrapper">
            <select [(ngModel)]="newNoteFolder" class="styled-select">
              <option value="General">General</option>
              <option *ngFor="let f of folders" [value]="f">{{f}}</option>
            </select>
            <ion-icon name="chevron-down-outline" class="select-arrow"></ion-icon>
          </div>
        </div>

        <div class="form-group">
          <label>Title</label>
          <input
            [(ngModel)]="newNoteTitle"
            class="styled-input"
            placeholder="New Note"
            type="text"
          />
        </div>

        <div class="form-group">
          <label>Content</label>
          <textarea
            [(ngModel)]="newNoteContent"
            class="styled-textarea"
            placeholder="Write your notes here..."
            rows="10"
          ></textarea>
          <div class="tip-box">
            <p>Tip: Use this format to create flashcards:</p>
            <p>Biology – The study of life</p>
            <p>Chemistry – The study of matter</p>
            <p>Physics – The study of energy</p>
          </div>
        </div>

        <div class="flashcard-format-box">
          <p class="ff-title">Flashcard Format</p>
          <p class="ff-desc">Use the format: <span class="ff-highlight">Answer – Question</span></p>
          <p class="ff-example">Example: Biology – The study of life</p>
        </div>
      </div>
    </div>

    <!-- ==================== FLASHCARD VIEW ==================== -->
    <div *ngIf="currentView === 'flashcards'" class="view-container flashcard-view">
      <div class="note-topbar">
        <button class="icon-btn" (click)="setView('notes')">
          <ion-icon name="arrow-back"></ion-icon>
        </button>
        <h3 class="fc-view-title">Flashcards</h3>
      </div>

      <div *ngIf="activeFlashcards.length === 0" class="empty-state">
        <ion-icon name="albums-outline" class="empty-icon"></ion-icon>
        <p>No flashcards found. Use "Answer – Question" format in your note.</p>
      </div>

      <div *ngIf="activeFlashcards.length > 0" class="flashcard-slider">
        <p class="fc-counter">{{currentCardIndex + 1}} / {{activeFlashcards.length}}</p>
        <div class="flashcard" [class.flipped]="cardFlipped" (click)="flipCard()">
          <div class="card-inner">
            <div class="card-front">
              <p class="card-label">Question</p>
              <p class="card-content-text">{{activeFlashcards[currentCardIndex]?.question}}</p>
              <p class="card-hint">Tap to reveal answer</p>
            </div>
            <div class="card-back">
              <p class="card-label">Answer</p>
              <p class="card-content-text">{{activeFlashcards[currentCardIndex]?.answer}}</p>
            </div>
          </div>
        </div>
        <div class="fc-nav">
          <button class="fc-nav-btn" (click)="prevCard()" [disabled]="currentCardIndex === 0">
            <ion-icon name="chevron-back"></ion-icon>
          </button>
          <button class="fc-nav-btn" (click)="nextCard()" [disabled]="currentCardIndex === activeFlashcards.length - 1">
            <ion-icon name="chevron-forward"></ion-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== NOTES VIEW ==================== -->
    <div *ngIf="currentView === 'notes'" class="view-container notes-view">
      <div class="search-bar-wrap">
        <ion-icon name="search-outline" class="search-icon"></ion-icon>
        <input [(ngModel)]="searchQuery" class="search-input" placeholder="Search notes..." type="text" />
      </div>

      <div class="tabs-row">
        <button class="tab-btn" [class.active]="activeTab === 'all'" (click)="activeTab = 'all'">All Notes</button>
        <button class="tab-btn" [class.active]="activeTab === 'General'" (click)="activeTab = 'General'">General</button>
        <button class="tab-btn icon-tab" [class.active]="activeTab === 'favorites'" (click)="activeTab = 'favorites'">
          <ion-icon name="star"></ion-icon>
        </button>
        <button *ngFor="let f of folders" class="tab-btn" [class.active]="activeTab === f" (click)="activeTab = f">{{f}}</button>
      </div>

      <div class="folder-add-row">
        <input [(ngModel)]="newFolderName" class="folder-input" placeholder="Folder name..." type="text" />
        <button class="folder-add-btn" (click)="addFolder()">Add</button>
        <button class="folder-cancel-btn" (click)="newFolderName = ''">Cancel</button>
      </div>

      <div class="sort-row">
        <button class="sort-btn" (click)="sortBy('az')">
          <ion-icon name="swap-vertical-outline"></ion-icon> A-Z
        </button>
        <button class="sort-btn" (click)="sortBy('created')">
          <ion-icon name="calendar-outline"></ion-icon> Created
        </button>
        <button class="sort-btn active-sort" (click)="sortBy('edited')">
          <ion-icon name="create-outline"></ion-icon> Edited
        </button>
      </div>

      <div class="notes-list">
        <div *ngIf="filteredNotes.length === 0" class="empty-state">
          <ion-icon name="document-outline" class="empty-icon"></ion-icon>
          <p>No notes yet. Tap + to create one!</p>
        </div>

        <div *ngFor="let note of filteredNotes" class="note-card">
          <div class="note-card-header">
            <span class="note-title">{{note.title}}</span>
            <button class="delete-btn" (click)="deleteNote(note.id)">
              <ion-icon name="trash-outline"></ion-icon>
            </button>
          </div>
          <div class="note-card-actions">
            <button class="note-action-btn btn-edit" (click)="editNote(note)">Edit</button>
            <button class="note-action-btn btn-flashcards" (click)="viewFlashcards(note)">
              <ion-icon name="albums-outline"></ion-icon> Flashcards
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== PREMIUM VIEW ==================== -->
    <div *ngIf="currentView === 'premium'" class="view-container premium-view">
      <div class="premium-topbar">
        <button class="icon-btn" (click)="goHome()">
          <ion-icon name="close"></ion-icon>
        </button>
        <div>
          <h3 class="premium-title-text">Premium Features</h3>
          <p class="premium-mode-label">Demo Mode</p>
        </div>
      </div>

      <div class="premium-hero">
        <ion-icon name="trophy-outline" class="trophy-icon"></ion-icon>
        <h2 class="hero-title">Go Premium!</h2>
        <p class="hero-sub">Unlock unlimited flashcards and multiplayer modes</p>
        <p class="hero-price">$4.99/month</p>
      </div>

      <div class="feature-grid">
        <div class="feature-card fc-purple">
          <ion-icon name="people-outline"></ion-icon>
          <p class="feat-title">Multiplayer</p>
          <p class="feat-sub">Study with friends</p>
        </div>
        <div class="feature-card fc-blue">
          <ion-icon name="help-circle-outline"></ion-icon>
          <p class="feat-title">Multiple Choice</p>
          <p class="feat-sub">Test your knowledge</p>
        </div>
        <div class="feature-card fc-green">
          <ion-icon name="flash-outline"></ion-icon>
          <p class="feat-title">Matching Game</p>
          <p class="feat-sub">Match pairs quickly</p>
        </div>
        <div class="feature-card fc-red">
          <ion-icon name="timer-outline"></ion-icon>
          <p class="feat-title">Timed Quiz</p>
          <p class="feat-sub">Beat the clock</p>
        </div>
      </div>

      <div class="benefits-section">
        <h4 class="benefits-title">Premium Benefits</h4>
        <div class="benefit-item" *ngFor="let b of benefits">
          <span class="benefit-dot"></span>
          <span>{{b}}</span>
        </div>
      </div>

      <button class="upgrade-btn">Upgrade Now</button>
    </div>

    <!-- FLOATING ACTION BUTTON -->
    <button *ngIf="currentView === 'notes'" class="fab-btn" (click)="openNewNote()">
      <ion-icon name="add"></ion-icon>
    </button>

    <!-- TOAST -->
    <div *ngIf="toastMessage" class="toast-msg">
      <ion-icon name="checkmark-circle-outline"></ion-icon>
      {{toastMessage}}
    </div>

  </div>
</ion-content>