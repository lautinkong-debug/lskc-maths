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
    studentEdition: "Student edition",
    teacherEdition: "Teacher edition",
    download: "Download",
    preview: "Preview",
    uploadedOn: "Uploaded",
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
    teachersOnly: "This page is for teachers.",
    adminsOnly: "This page is for admins.",
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
