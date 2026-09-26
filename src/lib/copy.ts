/**
 * Every string the site shows. Keep wording here so it stays consistent and
 * can be changed in one place. UI language is English - see CLAUDE.md.
 */
export const copy = {
  school: {
    name: "S.T.F.A. Lee Shau Kee College",
    department: "Mathematics Department",
    short: "LSKC Mathematics",
    crestAlt: "S.T.F.A. Lee Shau Kee College crest",
  },

  nav: {
    home: "Home",
    apps: "Web apps",
    mistakesBook: "Mistakes book",
    manage: "Manage",
    upload: "Upload book",
    manageBooks: "Books",
    manageTopics: "Topics",
    teachers: "Teachers",
    signIn: "Sign in",
    signOut: "Sign out",
    editPage: "Edit page",
    menu: "Menu",
    closeMenu: "Close menu",
  },

  home: {
    heroTitle: "Mathematics Department",
    heroIntro:
      "Interactive tools for the classroom, and every Mistakes Book in one place.",
    heroHint: "Drag the vertex",
    heroGraphLabel:
      "A parabola on graph paper. Drag its vertex, or use the arrow keys, to change the equation.",
    openFullApp: "Open the full quadratic explorer",
    appsCardTitle: "Web apps",
    appsCardBody:
      "Interactive tools by level and topic, with a projection mode for class.",
    appsCardAction: "Open",
    booksCardTitle: "Mistakes book",
    booksCardBody:
      "Correction notes by topic, in a student edition and a teacher edition.",
    booksCardAction: "Browse",
    latestTitle: "Latest uploads",
    latestEmpty:
      "Nothing uploaded yet. Teachers can add the first Mistakes Book from Manage.",
  },

  apps: {
    title: "Web apps",
    intro:
      "Interactive tools for teaching and revision. Every app works on a phone and has a projection mode for the classroom.",
    empty: "No apps match those filters yet.",
    filterLevel: "Level",
    filterStrand: "Strand",
    search: "Search apps",
    presentation: "Projection mode",
    exitPresentation: "Leave projection mode",
    hidden: "Hidden",
    unavailable: "This app isn't available right now.",
  },

  books: {
    title: "Mistakes book",
    intro:
      "Correction notes by level and topic. Teachers can also see the teacher edition.",
    empty: "No books for this topic yet. Teachers can upload one from Manage.",
    chooseLevel: "Choose a level",
    chooseTopic: "Choose a topic to see its books.",
    topicsTitle: "Topics",
    booksTitle: "Books",
    noTopics: "No topics are available for this level yet.",
    loading: "Loading books…",
    loadFailed: "Could not load books. Check that the emulators are running.",
    unavailable: "This book is unavailable or you do not have access to it.",
    studentEdition: "Student edition",
    teacherEdition: "Teacher edition",
    download: "Download",
    preview: "Preview",
    uploadedOn: "Uploaded",
    backToBooks: "Back to Mistakes Book",
    loadingFile: "Loading file…",
    fileFailed: "Could not open this file. Please try again.",
    docxHint: "This Word document is ready to download.",
    pageCount: (page: number, total: number) => `Page ${page} of ${total}`,
    previousPage: "Previous page",
    nextPage: "Next page",
    uploadTitle: "Upload a Mistakes Book",
    uploadIntro: "Add a student or teacher edition for a chapter.",
    manageTitle: "Manage Mistakes Books",
    manageIntro: "Edit details, replace a file, or remove a book.",
    titleLabel: "Title",
    descriptionLabel: "Description",
    levelLabel: "Level",
    topicLabel: "Topic",
    editionLabel: "Edition",
    fileLabel: "File",
    replacementLabel: "Replace file (optional)",
    replacementHint:
      "Choose the same file type as the current file. The edition cannot be changed after upload.",
    fileHint: "PDF, DOCX or HTML; maximum 20 MB.",
    noTopicForLevel:
      "No topics for this level yet. Add one in Manage Topics first.",
    chooseTopicOption: "Select a topic",
    uploadAction: "Upload book",
    uploading: "Uploading…",
    uploadSuccess: "Book uploaded.",
    saveAction: "Save changes",
    cancelAction: "Cancel",
    editAction: "Edit",
    deleteAction: "Delete",
    saved: "Book updated.",
    deleted: "Book deleted.",
    confirmDelete: "Delete this book and its file? This cannot be undone.",
    invalidDetails: "Enter a title and select a topic for the chosen level.",
    invalidFile:
      "Choose a PDF, DOCX or HTML file with the matching file extension.",
    emptyFile: "The selected file is empty.",
    tooLarge: "The file is larger than 20 MB.",
    differentType:
      "The replacement must be the same file type as the current file.",
    operationFailed:
      "Could not save this book. Check your connection and try again.",
    noManagedBooks: "No books uploaded yet. Start with Upload book.",
  },

  auth: {
    signInTitle: "Sign in",
    signInIntro:
      "Teachers sign in with their school Google account to upload and edit. Everyone else can browse without signing in.",
    signInWithGoogle: "Continue with Google",
    wrongDomain:
      "That account isn't a school account. Sign in with your @{domain} address.",
    notATeacher:
      "You're signed in, but you don't have teacher access yet. Ask an admin to add you.",
    signInRequired: "Sign in with your school Google account to continue.",
    checkingAccess: "Checking your access…",
    schoolOnlyTitle: "School sign-in required",
    schoolOnly: "Sign in with a verified school account to view this site.",
    testAccounts: "Local test accounts",
    testAccountsIntro:
      "These accounts work only with the local Firebase emulators.",
    signInFailed:
      "Sign-in failed. Check that the emulators are running and try again.",
    account: "Account",
    adminRole: "Admin",
    teacherRole: "Teacher",
    viewerRole: "Viewer",
    accessGranted: "Teacher access is active.",
    teachersOnly: "This page is for teachers.",
    adminsOnly: "This page is for admins.",
  },

  teachers: {
    title: "Manage teachers",
    intro: "Admins can add teachers and choose who has admin access.",
    email: "School email",
    name: "Name",
    admin: "Admin access",
    add: "Add teacher",
    remove: "Remove",
    noTeachers: "No teachers found.",
    invalidEmail: "Enter an email address on an allowed school domain.",
    saved: "Teacher list updated.",
    failed: "Could not update the teacher list. Please try again.",
    ownAccount: "Your account cannot be removed or demoted here.",
    confirmRemove: "Remove this teacher's access?",
  },

  topics: {
    title: "Manage topics",
    intro:
      "Add chapters, correct their details, and arrange them within each level.",
    chooseLevel: "Topics for level",
    topicCount: (count: number) =>
      `${count} ${count === 1 ? "topic" : "topics"}`,
    addTitle: "Add a topic",
    editTitle: "Edit topic",
    code: "Chapter code",
    name: "Topic name",
    level: "Level",
    strand: "Strand",
    add: "Add topic",
    save: "Save changes",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    moveUp: "Move up",
    moveDown: "Move down",
    empty: "No topics for this level yet. Add one using the form.",
    loading: "Loading topics…",
    saved: "Topic saved.",
    deleted: "Topic deleted.",
    reordered: "Topic order saved.",
    invalid:
      "Enter a chapter code and topic name, and choose a valid level and strand.",
    duplicate: "That chapter code already exists in this level.",
    inUse: "This topic has Mistakes Books and cannot be deleted.",
    failed: "Could not update topics. Check your connection and try again.",
    loadFailed: "Could not load topics. Check that the emulators are running.",
    confirmDelete: "Delete this topic? This cannot be undone.",
  },

  common: {
    loading: "Loading",
    comingSoon: "Coming soon",
    comingSoonBody: "This page is built in a later phase.",
    backToHome: "Back to home",
    notFound: "That page doesn't exist.",
  },

  footer: {
    builtFor: "Mathematics Department",
  },
} as const;
