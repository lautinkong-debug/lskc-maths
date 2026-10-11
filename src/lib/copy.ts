/**
 * Every string the site shows. Keep wording here so it stays consistent and
 * can be changed in one place. UI language is English - see CLAUDE.md.
 */
export const copy = {
  statisticalCharts: {
    vocabulary: {
      title: "Four words, one class",
      eyebrow: "Look · Say · Hide · Recall",
      example: "Class example",
      step: "step",
      oneClass: "One class interval",
      recordedStep: "Recorded to the nearest",
      halfStep: "half a step is",
      names: ["Class limits", "Class boundaries", "Class mark", "Class width"],
      phrases: [
        "Limits are Listed",
        "Boundaries are Between",
        "Mark is the Middle",
        "Width is the Whole bar",
      ],
      meanings: [
        "Read the two numbers listed in the class interval.",
        "Find the halfway points between neighbouring recorded classes.",
        "Find the midpoint of the two limits or the two boundaries.",
        "Subtract the lower boundary from the upper boundary.",
      ],
      modes: ["Look and say", "Hide and recall", "Calculate and check"],
      newExample: "Try another interval",
      diagram: "One class interval showing limits, boundaries, mark and width",
      recallDiagram: "Name the highlighted feature of the class interval",
      lowerBoundary: "Lower boundary",
      upperBoundary: "Upper boundary",
      halfRule: "Recorded measurements: go HALF A STEP out.",
      precisionRule:
        "Nearest 1 → ±0.5; nearest 0.1 → ±0.05; nearest 0.01 → ±0.005. This rule is for rounded measurements, not intervals already given as continuous boundaries.",
      play: "Play the four words",
      pause: "Pause the four words",
      next: "Next word",
      sayAloud:
        "Say the phrase, point to the feature, then explain what it measures.",
      recallProgress: "Recall",
      recallQuestion: "What is the highlighted feature called?",
      correct: "Correct.",
      lookAgain: "Look again.",
      complete:
        "All four recalled. Say the four phrases once more, then try another interval.",
      nextPrompt: "Next prompt",
      calculateTitle: "Find the six values for this class",
      calculateIntro:
        "Two limits, two boundaries, one mark and one width. Use the recorded step shown beside the diagram.",
      fields: [
        "Lower class limit",
        "Upper class limit",
        "Lower class boundary",
        "Upper class boundary",
        "Class mark",
        "Class width",
      ],
      check: "Check my values",
      allCorrect:
        "All six values are correct. Try another interval without looking at the worked values.",
      widthHint:
        "Use the whole bar between boundaries, not upper limit minus lower limit.",
      boundaryHint: "Move half the recorded step outside each limit.",
      markHint: "Average the two limits.",
      limitHint: "Copy the numbers listed in the class interval.",
    },
    animation: {
      title: "Animated walkthroughs",
      eyebrow: "Watch · Pause · Explain",
      lesson: "Teaching sequence",
      lessons: [
        "Leaves → frequencies → shape",
        "Cumulative rises → histogram",
        "Frequency and cumulative tables",
        "Read a cumulative frequency graph",
      ],
      play: "Play animation",
      pause: "Pause animation",
      back: "Previous step",
      next: "Next step",
      replay: "Replay animation",
      speed: "Playback speed",
      slow: "Slow",
      normal: "Normal",
      fast: "Fast",
      leafStart:
        "Every leaf represents one observation. Watch each leaf add one to its class frequency.",
      countLeaf: "Count age",
      counted: "Observations counted:",
      leafFinish:
        "The frequencies are 2, 4, 6 and 3. A schematic curve has its longer tail towards the lower ages: left-skewed.",
      riseStart:
        "Read the rise over each equal-width class interval, then transfer that increase to a histogram bar.",
      interval: "Class",
      zeroRise: "The polygon is flat: no increase, so no bar height.",
      positiveRise:
        "This increase is the class frequency, not the cumulative height.",
      sourceGraph: "Read each cumulative increase",
      resultGraph: "Build the histogram",
      weight: "Weight (kg)",
      weightBelow: "Weight less than (kg)",
      weightSteps: [
        "The frequency table counts each class. The cumulative table counts everything below each upper boundary.",
        "a = 5. The first cumulative frequency equals the first class frequency.",
        "x = 5 + 12 = 17. Add the next class frequency to the running total.",
        "b = 28 − 17 = 11. Subtract consecutive cumulative totals to recover a class frequency.",
        "y = 28 + 5 = 33. Continue the running total.",
        "z = 33 + 3 = 36. The last cumulative frequency is the total number of students.",
      ],
      billTitle: "Electricity bills: teaching example",
      amount: "Amount (HK$)",
      billNote:
        "Teaching reconstruction with explicit coordinates, not an exact digitisation of the photograph. Readings between boundaries are grouped-data estimates using straight-line interpolation.",
      coordinates: "Show the teaching coordinates",
      billCoordinates:
        "(300.5, 0), (400.5, 5), (500.5, 25), (600.5, 50), (700.5, 62), (800.5, 74), (900.5, 80).",
      billSteps: [
        "Start with the last point. What does its cumulative frequency tell us?",
        "Total number of households = 80. Use the final cumulative frequency, not the horizontal coordinate.",
        "Median target: 50% × 80 = 40. Start at cumulative frequency 40.",
        "Trace horizontally from 40 to the polygon.",
        "Trace down to the amount axis: median ≈ HK$560.5. This is a grouped-data estimate.",
        "85th percentile target: 85% × 80 = 68. Start at cumulative frequency 68, not 85.",
        "Trace horizontally from 68 to the polygon.",
        "Trace down: the 85th percentile ≈ HK$750.5 for this teaching graph.",
        "Voucher rule: bill < HK$500.5. Start at 500.5 on the amount axis and trace upwards.",
        "Trace left to read 25 households below HK$500.5. They receive the voucher.",
        "Households that cannot receive the voucher: 80 − 25 = 55. These have bills ≥ HK$500.5, including the boundary value.",
      ],
    },
    concepts: {
      title: "Connect the representations",
      eyebrow: "Predict · Explain · Explore",
      stemTab: "Stem-and-leaf → shape",
      cumulativeTab: "Cumulative frequency → histogram",
      next: "Next example",
      ages: "Ages of staff in a company",
      age: "Age (years)",
      value: "Value",
      stemIntro:
        "Read the stem-and-leaf diagram. Predict the overall shape, then count the leaves to check your reasoning.",
      cumulativeIntro:
        "Predict the histogram from the cumulative frequency polygon. Then reveal the class-by-class increases and edit the frequencies to explore the link.",
      stem: "Stem (10)",
      leaf: "Leaf (1)",
      key: "Key: 2 | 3 represents 23 years",
      editAges: "Edit the ages",
      applyAges: "Apply ages",
      ageError: "Enter 1–100 whole-number ages from 20 to 59.",
      shapeQuestion: "Which curve best represents the overall shape?",
      histogramQuestion: "Which histogram matches the cumulative frequencies?",
      shapes: ["Left-skewed", "Symmetric", "Right-skewed", "Bimodal"],
      option: "Option",
      check: "Check and explain",
      correct: "Correct. Follow the linked table and graph below.",
      tryAgain: "Look again at the evidence below, then try another choice.",
      customShape:
        "For your edited data, compare the four schematic shapes with the grouped curve below. More than one description may be reasonable.",
      tailRule:
        "Name skewness by the direction of the longer tail, not the position of the peak.",
      riseRule:
        "Class frequency = cumulative frequency at the upper boundary − cumulative frequency at the lower boundary.",
      explain: "See why it works",
      countLeaves:
        "Each leaf is one observation. Count the leaves in each stem to obtain the frequency in that ten-year interval.",
      shapeCaution:
        "These options are schematic. Grouping and smoothing affect the drawn curve; use the overall pattern rather than expecting one unique exact curve. Two separated peaks suggest a bimodal distribution.",
      flatRule:
        "A flat section has no increase: the corresponding class frequency is zero. It does not mean a constant positive frequency.",
      equalRise:
        "For equal class widths, equal rises give equal bar heights. A steeper segment means more observations in that interval; cumulative height itself is not the class frequency.",
      recovered: "Histogram from cumulative increases",
      editingEvidence:
        "The frequencies have changed. Compare the updated graphs and cumulative totals.",
    },
    advanced: {
      unsaved:
        "Invalid edits are not saved. Your last valid saved workspace is kept.",
      title: "Further Explorations",
      eyebrow: "Read beyond the shape",
      exploration: "Exploration",
      percentiles: "Percentiles & quartiles",
      twoData: "Compare two groups",
      percentileTitle: "From a percentage to a value.",
      percentileIntro:
        "Read across from a cumulative frequency, then down to the measurement axis.",
      twoTitle: "Two groups. One fair comparison.",
      twoIntro:
        "Use the same variable, units and class boundaries to compare the distributions.",
      method: "Construction method",
      polygon: "Straight polygon",
      curve: "Smooth curve",
      percentile: "Percentile",
      graph: "Distribution view",
      cumulativeGraph: "Cumulative distribution",
      frequencyGraph: "Frequency distribution",
      scale: "Comparison scale",
      percent: "Percentage",
      count: "Count",
      frequencyPercent: "Frequency (%)",
      cumulativePercent: "Cumulative frequency (%)",
      groupA: "Group A",
      groupB: "Group B",
      sampleSizes: "Sample sizes",
      fairComparison:
        "Percentages compare proportions when the sample sizes differ. Counts compare the numbers of observations.",
      sameVariable:
        "Group A uses the lab dataset. Group B uses the same variable, units and classes; edit its frequencies below.",
      sameClasses: "Class intervals follow Group A.",
      editB: "Group B frequencies",
      resetB: "Reset B to current classes",
      mismatch:
        "The groups need matching class boundaries. Reset B to the current classes before comparing.",
      noTotal:
        "A distribution needs a positive total frequency for percentile or percentage readings.",
      reading: "Read the graph",
      step1: "1. Find the target cumulative frequency.",
      step2: "2. Read across to the graph, then down.",
      estimateNote: "Approximate graph reading, shown to 2 decimal places.",
      flatNote:
        "The graph is horizontal at this cumulative frequency. Every value in the displayed interval gives the same graph reading; the grouped data do not identify a unique value.",
      polygonNote:
        "Straight segments estimate a uniform spread within each class. The result is a grouped-data estimate.",
      curveNote:
        "This estimate follows the displayed smooth curve. A different valid smooth curve can give a slightly different reading.",
      rawMedian: "Exact median of the raw data",
      rawNote:
        "The raw median uses the ordered observations, so it can differ from the graph estimate.",
      quartiles: ["Lower quartile", "Median", "Upper quartile"],
      library: "My activities & progress",
      author: "Create a teaching activity",
      authorHelp:
        "Choose the dataset, starting view and chart in the lab. Add instructions and save the activity here.",
      taskName: "Activity name",
      instructions: "Instructions for students",
      startLevel: "Starting practice level",
      saveLesson: "Save to my activities",
      savedLesson: "Activity library saved on this browser.",
      libraryLimit:
        "Up to 12 saved activities. Open and save again to create a revised copy.",
      shareTask:
        "Activity links and files include these instructions and settings, but never student attempts.",
      savedActivities: "Saved activities",
      noLessons: "No saved activities yet.",
      openLesson: "Open",
      deleteLesson: "Delete",
      undoDelete: "Undo last deletion",
      localOnly:
        "Saved only in this browser on this device. Clearing browser data removes local activities and progress. Use an activity file as a backup.",
      clearProgress: "Clear practice progress",
      storageError:
        "Browser storage is unavailable, full or contains an invalid saved record. The lab still works; use activity files to keep your example.",
      savedProgress: "Workspace and progress saved on this browser.",
      restored: "Previous workspace restored.",
      cleared: "Practice progress cleared.",
      loading: "Opening your workspace…",
      task: "Your activity",
      taskLevelNote:
        "The starting level applies when the activity is reopened. Each practice level keeps its own draft.",
    },
    classroom: {
      reading: "Read the difference",
      countInClass: "Frequency counts only the observations in this class.",
      belowBoundary: "observations lie below the upper class boundary",
      readingHelp:
        "Choose another class in a graph or the table. Notice how the cumulative count includes every preceding class.",
      chapter: "Form 2 / Chapter 6",
      compare: "Compare Charts",
      sameData: "One dataset. Five perspectives.",
      compareTitle: "See what changes. Find what stays.",
      compareIntro:
        "Follow a class across the graphs. Its frequency is a count; its cumulative frequency is a running total.",
      layout: "Comparison layout",
      layouts: {
        shape: "Histogram & frequency polygon",
        smooth: "Polygon & smooth curve",
        cumulative: "Cumulative polygon & curve",
        totals: "Frequency & cumulative frequency",
        all: "All five charts",
      },
      scaleNote:
        "Shared x and y scales · Frequency and cumulative frequency keep their own axis labels.",
      linked: "Select a class to highlight it in every chart.",
      tools: "Teacher & sharing tools",
      toolsSummary: "Prepare · present · take away",
      lesson: "Set up your lesson",
      lessonHelp:
        "Use the data and class settings below, then fix the example for this lesson.",
      fix: "Fix lesson dataset",
      unlock: "Unlock dataset",
      hideAnswers: "Hide model answers",
      allowAnswers: "Allow model answers",
      reset: "Reset student workspace",
      generate: "Another teaching example",
      controlHelp:
        "Reset keeps the fixed lesson and clears practice work. Answer controls affect worked solutions; tutorials still demonstrate construction. These are local teaching controls, without a login.",
      present: "Presentation View",
      exitPresentation: "Exit presentation",
      fixed: "Lesson dataset fixed",
      fixedHelp:
        "Data and class settings are locked. Unlock them in Teacher & sharing tools to edit.",
      answersHidden: "Model answers are hidden by the teacher controls.",
      takeAway: "Take this example with you",
      shareHelp:
        "Share the current dataset, class intervals, chart, view and display settings. Use anonymous measurements and a generic chart title.",
      share: "Copy activity link",
      link: "Activity link",
      saveActivity: "Save activity file",
      openActivity: "Open activity file",
      copied: "Activity link copied.",
      copyManually: "Select and copy the activity link below.",
      localShare:
        "A localhost link opens only on this computer. For other devices, use the hosted app address or send the activity file and open it in the lab.",
      large:
        "This example is too large for a reliable link. Use Save activity file, then Open activity file on the receiving device.",
      loaded: "Activity loaded.",
      invalidActivity:
        "This activity could not be loaded. Choose a valid Statistical Charts Lab activity file or link; your current example has been kept.",
      rawCSV: "Raw data CSV",
      tableCSV: "Frequency table CSV",
      groupedCSV:
        "Raw data CSV is available only when the source contains individual observations.",
      csvHeaders: [
        "Lower limit",
        "Upper limit",
        "Lower boundary",
        "Upper boundary",
        "Class mark",
        "Class width",
        "Frequency",
        "Cumulative frequency",
      ],
      exportChart: "Export chart",
      svg: "SVG",
      png: "PNG",
      downloaded: "Download ready.",
      exportFailed: "The chart could not be exported. Please try again.",
      print: "Printable view",
      printNow: "Print / Save PDF",
      close: "Back to workspace",
      printBrand: "LSKC Mathematics · Statistical Charts Lab",
      resetDone: "Student workspace reset to the lesson example.",
    },
    title: "Statistical Charts Lab",
    topic: "F2 · 2A06 · More about Statistical Charts",
    summary:
      "Turn your data into histograms, frequency polygons and cumulative frequency curves.",
    intro: "One dataset. Five ways to see the story.",
    subtitle:
      "Generate, edit and explore. Every chart follows the same frequency table.",
    explorer: "Data Explorer",
    builder: "Chart Builder",
    learning: {
      learn: "Step-by-Step Learning",
      practice: "Practice Mode",
      back: "Back to the lab",
      activityChart: "Activity chart",
      usesData:
        "Uses your current dataset. Changing the data or chart starts a new activity.",
      empty:
        "Return to the lab and enter a valid frequency distribution first.",
      previous: "Previous Step",
      next: "Next Step",
      restart: "Restart",
      hint: "Show Hint",
      answer: "Show Answer",
      check: "Check Answer",
      step: "Step",
      of: "of",
      nextPoint: "Reveal next point",
      nextBar: "Reveal next bar",
      revealed: "Revealed",
      complete: "Construction complete",
      prepare: "Prepare the data",
      calculate: "Calculate the plotting values",
      ends: "Add zero-frequency classes",
      axes: "Set up the axes",
      plot: "Plot the data",
      join: "Join the points",
      smooth: "Smooth the polygon",
      finish: "Complete the chart",
      prepareText:
        "Read the class intervals and frequencies. Every graph in this lesson uses this same table.",
      calculateHistogram:
        "Find the boundaries and width of each class. Rectangle heights will show the frequencies.",
      calculateFrequency:
        "Find the midpoint of each class interval. These class marks are the horizontal coordinates.",
      calculateCumulative:
        "Calculate the running totals. Match each cumulative frequency to its upper class boundary.",
      endsText:
        "Add one extra class of the same width at each end, each with frequency zero. Plot their class marks too.",
      axesHistogram:
        "Horizontal axis: the measured variable. Vertical axis: frequency. Bars will span the class boundaries.",
      axesFrequency:
        "Horizontal axis: class marks. Vertical axis: frequency. Use even numerical spacing.",
      axesCumulative:
        "Horizontal axis: class boundaries. Vertical axis: cumulative frequency. Start at the first lower boundary with zero.",
      plotHistogram:
        "Reveal one rectangle at a time. Check both boundaries and its height; neighbouring rectangles must touch.",
      plotPoints:
        "Reveal one point at a time and read its coordinates. The first and last points matter too.",
      joinText:
        "Join adjacent points from left to right with straight line segments.",
      smoothText:
        "Replace the sharp joins with a smooth curve. This is one valid smoothing, not a unique curve.",
      finishText:
        "Check the title, axes and plotted values. Explain how this graph represents the table.",
      hintHistogram:
        "Boundary = class limit adjusted by half the recording precision. For unrounded continuous data, use the given boundaries directly.",
      hintFrequency:
        "Class mark = (lower limit + upper limit) ÷ 2. The extra end marks are one class width beyond the first and last marks.",
      hintCumulative:
        "Add frequencies from the first class onwards. Use upper boundaries, with an extra initial point at the first lower boundary and zero.",
      question: "Calculation",
      input: "Your answer",
      row: "Class to calculate",
      calculation: "Calculation type",
      questions: {
        mark: "Class mark",
        low: "Lower class boundary",
        width: "Class width",
        cumulative: "Cumulative frequency",
      },
      nextQuestion: "Try the next class",
      correction: "Worked correction",
      solution: "Correct construction",
      sourceTable: "Given frequency distribution",
      sourceRaw: "Given raw observations",
      sourcePreview:
        "First 100 observations shown; the table includes the whole dataset.",
      precision: "Recording precision",
      continuous: "Continuous: use the boundaries as given.",
      difficulty: "Practice level",
      levels: [
        "1 · Guided calculations",
        "2 · Partially completed graph",
        "3 · Independent construction",
      ],
      guidedText:
        "Calculate a value from the table, check it and try another class.",
      partialText:
        "Some bars or points are given. Complete the missing parts, then choose how to join the points.",
      independentText:
        "Use only the given intervals and frequencies to calculate and enter every boundary or coordinate. The graph provides a numerical scale.",
      curvePractice:
        "Construct the polygon anchor points, then choose Smooth curve. This task checks those coordinates and your construction method; other smooth curves can also be valid.",
      coordinateHelp:
        "Tap the graph to add a point, or type exact coordinates below. Points are joined from left to right. Select a point to edit or remove it.",
      barHelp:
        "Select a class below, then tap the graph to set its height. Enter the lower and upper boundaries yourself for independent construction.",
      snap: "Pointer snapping",
      x: "Horizontal coordinate",
      y: "Vertical coordinate",
      end: "Right boundary",
      bar: "Rectangle",
      point: "Point",
      given: "Given",
      addPoint: "Add point",
      addBar: "Add rectangle",
      editItem: "Edit item",
      chooseBar: "Class for the next rectangle",
      remove: "Remove item",
      undo: "Undo last addition",
      connection: "Join style",
      connections: {
        none: "Unjoined points",
        straight: "Straight line segments",
        smooth: "Smooth curve",
      },
      submit: "Check construction",
      reveal: "Reveal correct solution",
      hideSolution: "Hide solution",
      reset: "Start again",
      retry: "Retry this construction",
      revealFirst: "Attempt the construction before revealing the solution.",
      matched: "Correct items",
      submitted: "Check result",
      noPoints: "Your graph starts here. Add a point or rectangle.",
      outside:
        "An entered item is outside the graph scale or incomplete. Check its numerical values below; it still counts when your work is marked.",
      blank: "Fill in every coordinate. Zero is a value; a blank is not zero.",
      model: "Model answer",
      yourGraph: "Your construction",
      graph: "Construction graph",
      draftReset: "Each level keeps its own attempt on this browser.",
      feedback: {
        correct:
          "Correct — the mathematical values and construction method agree with the table.",
        number:
          "Enter a valid number in every required box. Blank cells are not zero.",
        midpoint:
          "Use the midpoint of the two class limits, not either limit by itself.",
        halfUnit:
          "Use the lower class boundary. Subtract half the recording precision from the lower limit; for unrounded data, use the given boundary.",
        boundaryWidth:
          "Class width is upper boundary minus lower boundary, not upper limit minus lower limit.",
        runningSum:
          "Cumulative frequency adds all frequencies from the first class to this class.",
        retry: "Check the calculation and try again.",
        missing:
          "Some bars or points are missing. Use the table to complete the construction.",
        extra:
          "There are too many items. Remove extra points or rectangles before checking again.",
        zeroEnds:
          "Remember one zero-frequency class at each end. Its class mark is one class width beyond the first or last class mark.",
        classMarks:
          "Use class marks, not class limits, when plotting a frequency polygon or its curve.",
        startZero:
          "A cumulative frequency graph starts at the first lower class boundary with cumulative frequency zero.",
        neverDecrease:
          "Cumulative frequency never decreases from left to right. Add each class frequency to the previous total.",
        endTotal:
          "The final upper boundary must have cumulative frequency equal to the total number of observations.",
        touching:
          "Histogram bars must have positive widths and touch at adjacent class boundaries. Check for gaps or overlaps.",
        barBoundaries:
          "Draw each rectangle from its lower class boundary to its upper class boundary, not from its class limits.",
        heights: "Check each rectangle's height against its class frequency.",
        coordinates:
          "Check both coordinates: the horizontal value comes from a class mark or boundary; the vertical value comes from frequency or cumulative frequency.",
        straight:
          "A polygon uses straight line segments between adjacent points. Choose Straight line segments.",
        smooth:
          "This task asks for a curve. Choose Smooth curve after checking the anchor points.",
        negative: "Frequency and cumulative frequency cannot be negative.",
        duplicate:
          "Two items have the same horizontal coordinate. Remove the duplicate or correct its position.",
      },
    },
    settings: "Dataset settings",
    raw: "Raw observations",
    grouped: "Grouped frequencies",
    context: "Dataset context",
    titleLabel: "Dataset title",
    variable: "Variable",
    unit: "Unit",
    min: "Minimum value",
    max: "Maximum value",
    size: "Number of observations",
    shape: "Distribution shape",
    seed: "Reproducible seed",
    generate: "Generate New Data",
    reproduce: "Reproduce Seed",
    precision: "Measurement precision",
    precisions: [
      "Nearest unit (1)",
      "Nearest tenth (0.1)",
      "Nearest hundredth (0.01)",
      "Continuous (unrounded)",
    ],
    shapes: [
      "Uniform — evenly spread",
      "Bell-shaped — mostly in the middle",
      "Positive skew — mostly smaller values",
      "Negative skew — mostly larger values",
      "Two peaks — two clusters",
    ],
    contexts: [
      {
        name: "Mathematics test scores",
        variable: "Score",
        unit: "marks",
        min: 0,
        max: 100,
        precision: 1,
      },
      {
        name: "Heights of students",
        variable: "Height",
        unit: "cm",
        min: 140,
        max: 185,
        precision: 1,
      },
      {
        name: "Weights of students",
        variable: "Weight",
        unit: "kg",
        min: 35,
        max: 80,
        precision: 0.1,
      },
      {
        name: "Time to complete a race",
        variable: "Time",
        unit: "s",
        min: 12,
        max: 24,
        precision: 0.1,
      },
      {
        name: "Travel time to school",
        variable: "Travel time",
        unit: "min",
        min: 5,
        max: 65,
        precision: 1,
      },
      {
        name: "Monthly pocket money",
        variable: "Pocket money",
        unit: "HKD",
        min: 0,
        max: 1000,
        precision: 1,
      },
      {
        name: "Football sprint times",
        variable: "Sprint time",
        unit: "s",
        min: 4,
        max: 8,
        precision: 0.01,
      },
      {
        name: "Weekly exercise time",
        variable: "Exercise time",
        unit: "min",
        min: 0,
        max: 420,
        precision: 1,
      },
    ],
    custom: "Custom dataset",
    grouping: "Class intervals",
    start: "First lower limit / boundary",
    width: "Class width",
    count: "Number of classes",
    fit: "Fit classes to data",
    groupedNote:
      "Grouped frequencies do not reveal individual observations. Edit these intervals directly; exact regrouping needs the original raw data.",
    roundedNote:
      "Recorded data: boundaries lie half a measurement unit outside the class limits.",
    continuousNote:
      "Continuous data: lower boundary included, upper boundary excluded in every class. No half-unit correction is applied. Fit classes to data to cover the largest value.",
    paste: "Paste numbers or numeric CSV",
    pasteHint:
      "Separate numbers with commas, spaces or new lines. CSV must contain numbers only, without headings.",
    replace: "Use these values",
    import: "Import numeric CSV",
    add: "Add observation",
    remove: "Remove",
    clear: "Clear data",
    ascending: "Sort ascending",
    descending: "Sort descending",
    observation: "Observation",
    gridLimit:
      "Showing the first 100 observations. Use the full data editor below to edit the whole dataset.",
    fullData: "Edit all observations",
    addRow: "Add class",
    lower: "Lower limit",
    upper: "Upper limit",
    lowerBoundary: "Lower boundary",
    upperBoundary: "Upper boundary",
    interval: "Class interval",
    mark: "Class mark",
    frequency: "Frequency",
    cumulative: "Cumulative frequency",
    table: "Frequency distribution",
    fullTable: "Show all columns",
    total: "Total frequency",
    classes: "Classes",
    sample: "Observations",
    selected: "Selected class",
    select: "Select class",
    none: "Select a bar, point or table row to explore it.",
    chart: "Chart type",
    chartNames: [
      "Histogram",
      "Frequency polygon",
      "Frequency curve",
      "Cumulative frequency polygon",
      "Cumulative frequency curve",
    ],
    chartNotes: [
      "Bars touch at class boundaries. Equal class widths allow frequency to be shown by height.",
      "Plot class marks against frequencies. Add one zero-frequency class at each end and join with straight segments.",
      "A smooth representation of the frequency polygon. The curve is not uniquely determined by the table.",
      "Begin at the first lower boundary with zero. Plot each upper boundary against its cumulative frequency and join with straight segments.",
      "A smooth, non-decreasing curve from zero to the total frequency. Values read between boundaries are estimates.",
    ],
    controls: "Chart display",
    grid: "Gridlines",
    points: "Plotted points",
    labels: "Frequency labels",
    boundaries: "Boundary labels",
    marks: "Class-mark labels",
    overlay: "Histogram underneath",
    both: "Show construction polygon",
    guides: "Construction guides",
    reset: "Reset chart display",
    enlarge: "Enlarge chart",
    tableChartView: "Table & chart view",
    editFrequencies: "Edit frequencies",
    doneFrequencies: "Done editing",
    frequencyInputHelp:
      "Use a non-negative whole number; total must not exceed 1,000,000.",
    horizontalLabels: "Horizontal axis labels",
    axisMarks: "Class marks",
    axisBoundaries: "Class boundaries (lower / upper)",
    axisBoth: "Boundaries and class marks",
    axisNone: "No horizontal labels",
    shrink: "Show workspace",
    empty: "Add observations or frequencies to begin.",
    invalidChart: "Correct the data settings to draw an accurate chart.",
    zero: "Additional zero-frequency class",
    initial: "Starting boundary",
    live: "Changes update every chart immediately.",
    errors: {
      precision: "Choose a supported measurement precision.",
      emptyGroups: "Add at least one class interval.",
      classes: "Use between 1 and 24 classes.",
      numbers:
        "Enter finite numbers between −1,000,000 and 1,000,000. Blank cells and CSV headings are not numbers.",
      frequency: "Frequencies must be non-negative whole numbers.",
      order:
        "Put the lower limit before the upper limit. Continuous intervals must have positive width.",
      alignment:
        "Some values do not match the declared measurement precision. Adjust the values or precision.",
      overlap:
        "Intervals overlap or are out of order. Adjacent class boundaries must meet.",
      gap: "There is a gap between classes. Include the missing class, with zero frequency if necessary.",
      unequal:
        "These classes have unequal widths. A frequency-height histogram would be misleading. Use equal widths for this F2 lab.",
      total: "Keep the total grouped frequency at or below 1,000,000.",
      grouping:
        "Use a positive class width and class limits compatible with the measurement precision.",
      tooMany: "Use at most 10,000 observations.",
      uncovered:
        "Some observations fall outside the classes. Use Fit classes to data or adjust the starting limit, width and number of classes.",
      generator:
        "Check the range and sample size (1–10,000). The range must contain values at the chosen precision.",
      import:
        "This file could not be read. Choose a numeric CSV file smaller than 1 MB.",
    },
  },
  school: {
    name: "S.T.F.A. Lee Shau Kee College",
    department: "Mathematics Department",
    short: "LSKC Mathematics",
    crestAlt: "S.T.F.A. Lee Shau Kee College crest",
  },

  nav: {
    home: "Home",
    apps: "Web apps",
    joinChallenge: "Join a challenge",
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

  challenges: {
    newTitle: "Start a class challenge",
    newIntro:
      "Choose the questions and how your class will play. You can change the names shown on the board later.",
    myTitle: "Class challenges",
    myIntro:
      "Open a room to project its join code, follow the scores or review the results.",
    myEmpty: "No challenges yet. Create one for your class.",
    title: "Challenge title",
    type: "Challenge type",
    liveNow: "Live now",
    homework: "Homework",
    classTag: "Class (optional)",
    noClass: "No class",
    skills: "Question skills",
    level: "Level",
    questions: "Questions",
    timeLimit: "Time limit",
    noTime: "No time pressure",
    minutes: (n: number) => `${n} ${n === 1 ? "minute" : "minutes"}`,
    closesAt: "Closes on",
    scoring: "Scoring",
    directed: "Directed: wrong answer −5",
    gentle: "Gentle: wrong answer 0",
    attempts: "Attempts",
    order: "Question order",
    sameOrder: "Same for everyone",
    shuffledOrder: "Shuffle for each student",
    names: "Names on the board",
    allNames: "All names",
    topTenNames: "Top 10 only",
    avatarsOnly: "Avatars only",
    create: "Create challenge",
    creating: "Creating challenge…",
    createError:
      "Check the settings and try again. The closing time must be in the future.",
    gentlePreset: "Gentle scoring",
    noTimerPreset: "No timer",
    avatarsPreset: "Avatars only",
    lobby: "Waiting for players",
    waiting: "Get ready! Your teacher will start soon.",
    joinAt: "Join at",
    joinCode: "Join code",
    joinUrl: "Join link",
    qrAlt: "QR code to join this challenge",
    players: (n: number) => `${n} ${n === 1 ? "player" : "players"}`,
    start: "Start",
    cancelRoom: "Cancel challenge",
    live: "Live board",
    timeLeft: (value: string) => `${value} left`,
    extend: "+2 min",
    endNow: "End now",
    hideBoard: "Hide board",
    showBoard: "Show board",
    morePlayers: (n: number) => `… and ${n} more players`,
    answersSoFar: (n: number) => `${n} answers so far`,
    classAccuracy: (n: number) => `Class accuracy ${n}%`,
    results: "Results",
    reveal: "Reveal next podium place",
    podium: "Podium",
    mostImproved: "Most improved",
    missedQuestions: "Questions to revisit",
    mostMissed: "Most missed first",
    showMe: "Show me",
    teacherDetails: "Teacher results and class numbers",
    hideTeacherDetails: "Hide teacher results",
    playAgain: "Play again with these settings",
    deleteRoom: "Delete challenge",
    deleteConfirm:
      "Delete this challenge and all its scores? This cannot be undone.",
    backToChallenges: "All challenges",
    noScores: "Scores will appear when students finish.",
    roomMissing: "That challenge could not be found.",
    roomError:
      "Could not load this challenge. Check your connection and try again.",
    actionError: "That change did not save. Try again.",
    joinTitle: "Join a class challenge",
    joinIntro: "Enter your teacher's six-character code.",
    joinSteps: [
      "Enter the code on your classroom screen.",
      "Choose a nickname and an avatar.",
      "Play, learn and help your class improve.",
    ],
    codePlaceholder: "K7P 4QX",
    joinNoAccount: "No account to create. Your teacher's code gets you in.",
    joinSchoolAccount: "Use your school Google account to join your class.",
    enterCode: "Six-character code",
    findRoom: "Find challenge",
    codeError:
      "That code doesn't match an open challenge. Check it with your teacher.",
    chooseIdentity: "Choose your game identity",
    nickname: "Nickname",
    avatar: "Avatar",
    shuffle: "Surprise me",
    frame: "Avatar frame",
    classNumber: "Class number (optional)",
    classNumberHelp: "Only your teacher sees this.",
    join: "Join challenge",
    joining: "Joining…",
    privacyNotice:
      "We only keep your nickname, avatar and scores for this challenge, and your class number if you add one (only your teacher can see it). Everything is deleted automatically 60 days after the challenge closes.",
    startRun: "Start my questions",
    starting: "Starting…",
    countdown: (n: number) => (n === 0 ? "Go!" : String(n)),
    submitting: "Checking your answers…",
    yourResult: "Your result",
    scoreWorking: "Score as directed numbers",
    gap: (points: number) =>
      `${points} ${points === 1 ? "point" : "points"} to the next place`,
    gapLoading: "Checking the gap to the next place…",
    topPlace: "You are at the top!",
    personalBest: "Personal best!",
    attemptsLeft: (n: number) =>
      `${n} ${n === 1 ? "attempt" : "attempts"} left`,
    reviewAnswers: "Review answers",
    yourAnswer: (answer: string) => `Your answer: ${answer || "(skipped)"}`,
    correctAnswer: (answer: string) => `Correct answer: ${answer}`,
    nextAttempt: "Try another attempt",
    finished: "You have finished this challenge.",
    returnToPlay: "Return to Play",
    boardsTitle: "Class vs class",
    yourClass: "Your class",
    boardsIntro: "Every student's best result helps their class average.",
    boardSeason: "Season",
    boardLevel: "Level",
    boardEmpty:
      "No class results yet. A class appears after at least five players finish.",
    boardPlayers: (n: number) => `${n} players`,
    average: (n: number) => `Average ${n}`,
    questionAccuracy: (percent: number, correct: number, attempts: number) =>
      `${percent}% correct · ${correct} of ${attempts} answers`,
    loading: "Loading challenge…",
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
    announcement: "Announcement",
    noAnnouncement: "No announcement is showing.",
    heroTitleLabel: "Hero title",
    heroIntroLabel: "Home introduction",
    announcementText: "Announcement text",
    announcementLink: "Link (optional)",
    announcementActive: "Show announcement",
    announcementEdit: "Edit announcement",
    featuredTitle: "Featured web apps",
    featuredManage: "Choose featured apps",
    featuredEmpty:
      "No apps are featured yet. Choose them on the Web Apps page.",
  },

  apps: {
    directedNumbers: {
      title: "Directed number operations",
      topic: "Directed Numbers and the Number Line",
      summary:
        "Learn, play and compete: add, subtract, multiply and divide directed numbers.",
      tabs: {
        "number-line": "Number line",
        "add-subtract": "Add & subtract",
        "sign-magnitude": "Sign & magnitude",
        brackets: "Brackets",
        "multiply-divide": "× and ÷",
        mixed: "Mixed",
        textbook: "Textbook practice",
        play: "Play ★",
      },
      mode: "Choose a mode",
      demonstration: {
        controls: "Teacher demonstration controls",
        play: "Play demonstration",
        pause: "Pause demonstration",
        previous: "Previous step",
        next: "Next step",
        replay: "Replay from start",
        speed: "Speed",
        slow: "Slow",
        normal: "Normal",
        progress: (n: number, total: number) => `Step ${n} of ${total}`,
        start:
          "Read the expression. Follow the highlighted signs and brackets, one step at a time.",
        signPair: (a: string, b: string, result: string) =>
          `${a} (${b}) becomes ${result}`,
        bracketStage: "1 · Remove brackets",
        startStage: "2 · Measure the starting distance",
        moveStage: "3 · Show the movement",
        magnitudeStage: "4 · Calculate the magnitude",
        answerStage: "5 · Attach the sign",
        startDistance: (n: number | string) => `Starting distance: ${n}`,
        moveDistance: (n: number | string) => `Movement distance: ${n}`,
        remaining: (n: number | string) => `Remaining distance: ${n}`,
        total: (n: number | string) => `Total distance: ${n}`,
        zero: "The two distances cancel: 0",
        graphReady: "Brackets first; the graph follows.",
        startHint: "Measure from the starting point to zero.",
        moveHint: "Follow the operation after removing the brackets.",
        resultHint:
          "Read the sign from the side of zero. Attach it to the magnitude.",
        complete: "Demonstration complete",
        textbookIntro:
          "Teacher demonstration: highlight the signs, animate each bracket removal, then calculate one step at a time.",
        selected: (n: number, count: number) => `Question ${n} of ${count}`,
        working: "Animated working",
        allSteps: "All completed steps",
        graphSteps: "Number-line working",
      },
      magnitudeLesson: {
        title: "Where do we finish?",
        intro:
          "Remove the brackets first. Then animate the movement and calculate the magnitude directly on the number line.",
        start: "Starting value",
        operand: "Second number",
        operation: "Operation",
        apply: "Draw my number line",
        range:
          "Enter valid numbers from −100 to +100. A fraction must have a non-zero denominator.",
        inputHelp:
          "Use an integer, decimal (3.1), fraction (1/2) or mixed number (−1 1/2). Values must be between −100 and +100.",
        exactCaption: (start: string, movement: string, end?: string) =>
          `Number line: start at ${start}; ${movement}${end === undefined ? "." : `; finish at ${end}.`}`,
        examples: "Try these cases",
        sourceCases: "Examples from the textbook diagram",
        extraCases: "Explore negative subtraction and zero",
        move: "Show movement",
        explain: "Explain the result",
        replay: "Start again",
        movement: "Movement",
        finish: "Final value",
        sign: "Sign of the answer",
        magnitude: "Magnitude of the answer",
        positive: "Positive: right of 0",
        negative: "Negative: left of 0",
        zero: "Zero: neither positive nor negative",
        result: "Read the final position",
        zeroMark: "Zero",
        startMark: "Start",
        endMark: "Finish",
        distance: (n: number | string) => `${n} units from 0`,
        motion: (n: number | string, delta: number) =>
          delta === 0
            ? "No movement (0 units)"
            : `${n} units ${delta > 0 ? "right" : "left"}`,
        normalise: "First turn subtraction into addition of the opposite:",
        compare: "Compare the magnitudes",
        noMove: "Adding or subtracting zero leaves the value unchanged.",
        fromZero:
          "Starting at zero, the direction of movement determines the sign and the movement distance gives the magnitude.",
        same: "The starting value and the signed movement have the same sign. Move further from zero: add their magnitudes and keep that sign.",
        cancel:
          "The magnitudes are equal and the signs are opposite. The movement reaches zero, so the result is 0.",
        opposite:
          "The starting value and the signed movement have opposite signs. Subtract the smaller magnitude from the larger; keep the sign of the one with the larger magnitude.",
        crosses:
          "The movement passes zero. The final value has the sign of the signed movement.",
        stays:
          "The movement does not reach zero. The final value keeps the starting value’s sign.",
        prompt: "Predict the sign and magnitude before revealing the result.",
        signChoice: "Predicted sign",
        positiveChoice: "Positive",
        negativeChoice: "Negative",
        zeroChoice: "Zero",
        magnitudeChoice: "Predicted magnitude",
        check: "Check prediction",
        correct: "Correct. Now check both against the number line.",
        wrongSign:
          "Check which side of zero the movement finishes on. Moving left does not always give a negative answer.",
        wrongMagnitude:
          "Magnitude is the final distance from zero. It is never negative and may differ from the distance moved.",
        required: "Choose a sign and enter a non-negative magnitude.",
        caption: (start: number, delta: number, end?: number) =>
          `Number line: start at ${start}, move ${Math.abs(delta)} units ${delta < 0 ? "left" : delta > 0 ? "right" : "without changing position"}${end === undefined ? "." : `, finish at ${end}, ${Math.abs(end)} units from zero.`}`,
        textbookLink: "Practise textbook questions",
      },
      textbookLesson: {
        title: "Textbook practice",
        intro:
          "Practise questions from Directed Numbers and the Number Line. Check your answer, then explore the working or a number-line explanation.",
        coverage:
          "Included: Exercise 2B Q1–15 and Q21–28; Exercise 2C Q1–16 and Q20–33. These are the numerical calculation questions; word problems and other exercises are not included yet.",
        source:
          "Source: supplied 1A02 textbook, pp. 2.32–2.34 and 2.46–2.48. Answers checked against pp. 2.68–2.69. Division bars are displayed as equivalent ÷ expressions.",
        exercise: "Exercise",
        exerciseName: (name: string) => `Exercise ${name}`,
        level: "Difficulty",
        all: "Both levels",
        levelName: (n: number) => `Level ${n}`,
        question: "Question",
        reference: (exercise: string, question: number, part: string) =>
          `Exercise ${exercise} · Q${question}(${part})`,
        page: (n: number) => `Textbook p. 2.${n}`,
        progress: (n: number, count: number, correct: number) =>
          `Question ${n} of ${count} · ${correct} correct in this selection`,
        answer: "Your answer",
        answerHelp:
          "Use an integer, decimal, fraction (e.g. -3/2) or mixed number (e.g. -1 1/2).",
        check: "Check answer",
        correct: "Correct. Equivalent fractions and decimals are accepted.",
        retry:
          "Check the signs and the order of operations. Reveal the working if you need a hint, then try again.",
        signHint: "The magnitude is right. Check the sign of your answer.",
        reveal: "Show working",
        hide: "Hide working",
        previous: "Previous question",
        next: "Next question",
        bird: "Explore with the bird",
        magnitude: "Explore sign & magnitude",
        working: "Working",
        result: "Answer",
      },
      journeyLabel: "Learn, play and compete",
      learnNav: "Learn",
      playNav: "Play",
      competeNav: "Compete",
      later: "Coming in a later stage",
      laterBody:
        "Explore Number line, Add & subtract and Brackets while the next lessons are being prepared.",
      numberLesson: {
        title: "Meet the numbers",
        intro:
          "Move a point. Its position tells you its value; its distance from 0 tells you its magnitude.",
        points: "Points",
        explore: "Explore points",
        point: (name: string) => `Point ${name}`,
        add: "Add a point",
        remove: "Remove selected point",
        value: "Selected point value",
        range: "Use a whole number from −100 to +100.",
        selected: "Selected point",
        magnitude: "Magnitude",
        opposite: "Opposite",
        sign: "Sign",
        positive: "Positive",
        negative: "Negative",
        zero: "Neither positive nor negative",
        opposites: "Show opposites",
        vertical: "Vertical number line",
        skin: "Appearance",
        plain: "Plain",
        thermometer: "Thermometer",
        lift: "Lift",
        drag: "Drag a point, or focus it and use arrow keys. Hold Shift to move 5 units. You can also type its value below.",
        pointValue: (name: string, value: string) => `Point ${name}, ${value}`,
        picture: (values: string, vertical: boolean) =>
          `Number line with points ${values}. Numbers increase ${vertical ? "from bottom to top" : "from left to right"}.`,
        oppositeNote: (v: string, opposite: string, distance: number) =>
          `${v} and ${opposite} are both ${distance} units from 0. ${distance === 0 ? "Zero is its own opposite." : "They have the same magnitude and opposite signs."}`,
        compare: "Compare two points",
        first: "First point",
        second: "Second point",
        predict: "Which comparison is true?",
        correct: "Yes. Check the positions on the line.",
        equal: "These points have the same value, so they share a position.",
        position: (larger: string, smaller: string, vertical: boolean) =>
          `${larger} is ${vertical ? "higher than" : "further right than"} ${smaller}, so it is greater.`,
        positiveRule:
          "For two positive numbers, the larger magnitude gives the greater number.",
        negativeRule:
          "For two negative numbers, the smaller magnitude gives the greater number. It is closer to 0.",
        mixedRule:
          "Every positive number is greater than every negative number.",
        zeroRule:
          "Positive numbers are greater than 0. Negative numbers are less than 0.",
        checkPositions:
          "Look at the positions, not just the digits. The number further right (or higher) is greater.",
        order: "Put the numbers in order",
        ascending: "Ascending: smallest to greatest",
        descending: "Descending: greatest to smallest",
        orderHelp:
          "Drag a chip onto another place, or use its earlier and later buttons. Its sign always moves with it.",
        earlier: (value: string) => `Move ${value} earlier`,
        later: (value: string) => `Move ${value} later`,
        check: "Check order",
        ordered: "That's it! Each number is in the right place.",
        orderHint: (a: string, b: string, ascending: boolean) =>
          `Check ${a} and ${b}. For ${ascending ? "ascending" : "descending"} order, ${ascending ? "the smaller number" : "the greater number"} goes first.`,
        show: "Show me the order",
        retry: "Try this set again",
        count: "How many numbers?",
        next: "Next: Add & subtract with the bird",
        birdLink: "Learn addition and subtraction with the bird →",
        play: "Practise in Number Line Town",
        think: "Is −8 greater than −3 because 8 is greater than 3?",
        thought:
          "No. −3 is further right, so −3 > −8. The number 8 describes the distance of −8 from 0, not how large −8 is.",
      },
      bracketLesson: {
        title: "Two signs, one operation",
        intro:
          "Remove one bracket at a time. Read the signs first, then work out the size.",
        scope:
          "Use addition and subtraction with up to five terms. Decimals, fractions and square brackets are welcome. Save × and ÷ for the next lesson.",
        load: "Show bracket steps",
        remove: "Remove next bracket",
        calculate: "Work out next sum",
        tap: "Tap the highlighted bracket to remove it.",
        inside: "Work inside the square brackets first.",
        rules: "How the signs combine",
        summary:
          "Two signs next to each other: the same means +; different means −.",
        rulesTex: {
          "++": "a + (+b) = a + b",
          "+-": "a + (-b) = a - b",
          "-+": "a - (+b) = a - b",
          "--": "a - (-b) = a + b",
        },
        notes: {
          "++": "Both signs are +. Replace + (+…) with +….",
          "+-": "The signs are different. Replace + (−…) with −….",
          "-+": "The signs are different. Replace − (+…) with −….",
          "--": "Both signs are −. Replace − (−…) with +….",
          unwrap:
            "This bracket groups the number. Keep its value when you remove it.",
          same: "Same signs: add the magnitudes and keep the sign.",
          different:
            "Different signs: keep the sign of the larger magnitude. Subtract the smaller magnitude from the larger.",
          cancel:
            "Equal magnitudes and opposite signs give 0. Zero has no sign.",
          zero: "Adding or subtracting 0 leaves the number unchanged.",
          removeAll: "Remove the brackets by combining each pair of signs.",
        },
        predict: "What operation will the two signs become?",
        predictRight: "Yes. Now remove the bracket to see the change.",
        predictWrong:
          "Check the pair of signs: same gives +; different gives −. Try again, or choose Show me.",
        signSize: "Sign first, then size",
        gain: "Gains",
        loss: "Losses",
        barLabel: (positive: string, negative: string) =>
          `Gain ${positive}; lose ${negative}. Both bars start at 0. Compare their lengths.`,
        signExplain: (gain: string, loss: string, result: string) =>
          `Total gains: ${gain}. Total losses: ${loss}. The difference gives ${result}.`,
        answer: "What is the final answer?",
        check: "Check answer",
        correct: "Yes. Your answer has the right sign and size.",
        wrongSign:
          "Your size is right. Check the sign: which is larger, the total gains or the total losses?",
        wrongSize:
          "Compare total gains with total losses. Subtract the smaller total from the larger, then use the sign of the larger total.",
        reorder: "Reorder the signed terms",
        reorderHelp:
          "Keep each sign attached to its number. Grouping gains and losses changes the order, but not the total.",
        think: "Can we reorder subtraction just by swapping the numbers?",
        thought:
          "No: 5 − 8 is −3, but 8 − 5 is +3. Write +5 and −8, then move each term with its sign: −8 + 5 is still −3.",
        next: "Next: Multiply & divide",
        play: "Practise on Hop Island",
        ready: "All brackets are removed. Now combine the signed terms.",
        finished: "Complete. The final answer is double-underlined.",
        keys: "Keys: PageDown / → / Space = next, PageUp / ← = back, R = reveal, N = new, P = Predict first.",
      },
      arithmetic: {
        load: "Show working",
        notes: {
          "inner-brackets-first": "Work inside the innermost brackets first.",
          "mult-div-first": "Multiply or divide before adding or subtracting.",
          "left-to-right":
            "For operations at the same level, work from left to right.",
          "same-sign-product": "Same signs make a positive product.",
          "diff-sign-product": "Different signs make a negative product.",
          "same-sign-quotient": "Same signs make a positive quotient.",
          "diff-sign-quotient": "Different signs make a negative quotient.",
          "count-negatives":
            "Count the negative factors: even gives positive; odd gives negative.",
          reciprocal:
            "Dividing by a fraction means multiplying by its reciprocal.",
          "mixed-to-improper":
            "Change the mixed number to an improper fraction before calculating.",
        },
      },
      multiplyLesson: {
        title: "Multiply and divide directed numbers",
        intro:
          "See where the sign rules come from, then use them with products and quotients.",
        panels: {
          pattern: "Pattern",
          repeated: "Repeated addition",
          signs: "Sign rules",
          many: "Many factors",
        },
        pattern: {
          title: "Continue the pattern",
          intro:
            "Keep the first factor fixed. The second factor drops by 1 each row. Watch how the product changes through 0.",
          fixed: "Fixed factor",
          positivePreset: "+5",
          negativePreset: "−3",
          multiplier: "Second factor",
          product: "Product",
          next: "Next row",
          back: "Previous row",
          reveal: "Show next product",
          predict: (multiplier: string) =>
            `What is the product when the second factor is ${multiplier}?`,
          check: "Check product",
          correct: "Yes. Keep the pattern going.",
          wrong: (change: string) =>
            `Each time the second factor drops by 1, the product changes by ${change}. Follow the rows through 0.`,
          chart:
            "Column chart of the products revealed so far; bars cross 0 as the sign changes.",
          conclusion: (factor: string, change: string) =>
            `With ${factor} fixed, each step down in the second factor changes the product by ${change}. The same pattern continues below 0.`,
          range: "Choose a whole number from −9 to +9.",
        },
        repeated: {
          title: "Repeated addition makes equal hops",
          intro:
            "A negative number multiplied by a positive whole number is that many equal leftward hops from 0.",
          magnitude: "Size of the negative number",
          count: "Number of times",
          next: "Next hop",
          back: "Previous hop",
          reset: "Start again",
          line: (size: number, count: number, shown: number) =>
            `${count} hops of −${size} from 0. ${shown} ${shown === 1 ? "hop" : "hops"} shown.`,
          working: "Repeated addition",
          result: (value: string) => `We land at ${value}.`,
          zero: "Zero hops leave us at 0.",
        },
        signs: {
          title: "The same sign rules work for × and ÷",
          first: "First number",
          second: "Second number",
          operation: "Operation",
          product: "Product or quotient",
          check: "Check answer",
          reveal: "Show me",
          same: "Same signs → positive",
          different: "Different signs → negative",
          zero: "A zero factor makes a product 0. Zero has no sign.",
          dividingZero: "You can't divide by 0. Change the second number.",
          invalid: "Enter two valid numbers to see the rule.",
          correct: "Yes. The sign and the size are both right.",
          wrongSign:
            "The size is right. Check the signs: same gives +; different gives −.",
          wrongSize:
            "Decide the sign first. Then multiply or divide the magnitudes.",
          fraction: "The same division can be written as a fraction.",
          row: (a: string, b: string) => `${a} and ${b}`,
        },
        many: {
          title: "Count the negative signs",
          intro:
            "Build a chain of up to six factors. Count the negatives, then calculate × and ÷ from left to right.",
          factor: (index: number) => `Factor ${index}`,
          operation: (index: number) => `Operation ${index}`,
          add: "Add a factor",
          remove: "Remove last factor",
          apply: "Show chain working",
          count: (count: number) =>
            `${count} negative ${count === 1 ? "sign" : "signs"} → ${count % 2 === 0 ? "even" : "odd"} → ${count % 2 === 0 ? "positive" : "negative"}.`,
          zero: "A factor of 0 makes the result 0, unless you try to divide by 0.",
          invalid: "Check each factor. A divisor cannot be 0.",
          reciprocal: (value: string) =>
            `Dividing by a fraction becomes multiplying by its reciprocal, ${value}.`,
          scope:
            "Use only multiplication and division in this lesson. Use Mixed for + and −.",
          step: "Next working line",
          complete: "The chain is complete.",
        },
        think: "Think about it: why is a negative times a negative positive?",
        thought:
          "Look at the pattern as the second factor falls through 0. The products continue changing by the same amount; they do not jump to a new rule.",
        next: "Next: Mixed operations",
        play: "Practise in Sign Snap",
      },
      mixedLesson: {
        title: "Mixed operations, one step at a time",
        intro:
          "Choose what to do first, then reveal one working line at a time. Fractions stay exact.",
        rules: "Order of operations",
        order: [
          "Work inside the innermost brackets first.",
          "Do × and ÷ before + and −.",
          "At the same level, work from left to right.",
        ],
        nextStep: "Next step",
        choose: "You choose: what should be done next?",
        choiceLabel: (index: number) => `Choose operation ${index}`,
        choiceRight: "Yes. That is the part to work out next.",
        choiceWrong: (rule: string) =>
          rule === "inner-brackets-first"
            ? "Start inside the innermost brackets. Then return to the rest."
            : rule === "mult-div-first"
              ? "Multiply or divide before adding or subtracting."
              : rule === "reciprocal"
                ? "Before dividing by a fraction, change to multiplication by its reciprocal."
                : "At the same level, choose the operation furthest left.",
        predictPrompt:
          "Which part comes next? Choose it, or reveal the next step.",
        nextPrompt: "Read the highlighted rule, then show the next line.",
        finished: "Complete. The final answer is double-underlined.",
        preset: (index: number) => `Example ${index}`,
        signWorking: "Show sign working",
        decimal: "Show decimal too",
        decimalAnswer: "Decimal form:",
        answer: "What is the final answer?",
        check: "Check answer",
        answerRight: "Yes. Your answer has the right sign and size.",
        wrongSign: "Your size is right. Check the sign of the final result.",
        wrongSize:
          "Check the order: brackets first, then × and ÷, then + and −. Work left to right within each level.",
        think: "Does left to right mean adding before multiplying?",
        thought:
          "No. Multiplication and division come first. Left to right applies only to operations at the same level.",
        play: "Practise in Order Castle",
      },
      playLesson: {
        prompts: {
          compare: (a: string, b: string) =>
            `Which sign makes ${a} and ${b} correct?`,
          order: (values: string) =>
            `Put these numbers in ascending order: ${values}`,
          readLine: "What number is marked A on the line?",
          sign: "Is the result positive, negative or zero?",
          mistake: (expression: string, value: string) =>
            `${expression} = ${value}. Is this working correct?`,
          word: (context: string, start: string, change: string) =>
            `${context} ${start}. It changes by ${change}. What is the new value?`,
          wordContexts: [
            "The temperature is",
            "The lift starts at floor",
            "A diver is at",
            "An Octopus card balance is",
            "A quiz score is",
            "A game score is",
          ],
          mixed: "What should you do first, then what is the value?",
          evaluate: "Work out the expression.",
          addFirst: "Add first",
          subtractFirst: "Subtract first",
          multiplyFirst: "Multiply first",
          divideFirst: "Divide first",
          bracketFirst: "Work inside brackets first",
          yes: "Yes",
          no: "No",
          positive: "positive",
          negative: "negative",
          zero: "zero",
        },
        title: "Number Line Quest",
        experience: "Experience points",
        exploreWorlds: "Explore the six worlds",
        worldsHelp: "Every world is open. Choose your own starting point.",
        dailyAction: "Start daily challenge",
        chooseWorld: "Choose a world",
        dailyComplete: "Completed today",
        competeTitle: "Better together.",
        competeIntro:
          "Join your class, try your best and help your class average grow.",
        intro:
          "Choose any world. A little practice each day builds your directed-number skills.",
        worlds: [
          "Number Line Town",
          "Lift Rush",
          "Hop Island",
          "Sign Snap",
          "Order Castle",
          "Red Pen HQ",
        ],
        skills: [
          "Compare and order",
          "Add and subtract",
          "Brackets and moves",
          "Signs of × and ÷",
          "Mixed operations",
          "Spot the mistake",
        ],
        skillLabels: {
          numberLine: "Number line",
          addSubtract: "Add & subtract",
          brackets: "Brackets",
          signs: "Signs of × and ÷",
          mixed: "Mixed operations",
          wordProblems: "Word problems",
          mistakes: "Spot the mistake",
        },
        coming:
          "This world's special game arrives in the next stage. Try its questions in Challenge Run now.",
        recommended: "Recommended next",
        level: (n: number) => `Level ${n}`,
        boss: "Boss level",
        stars: (n: number) => `${n} of 54 stars`,
        xp: (n: number, next: number) => `${n} / ${next} XP`,
        streak: (n: number) => `Daily streak ${n}`,
        ranks: [
          "Number Line Novice",
          "Integer Explorer",
          "Sign Seeker",
          "Bracket Breaker",
          "Order Master",
          "Directed Number Legend",
        ],
        today: "Today's challenge",
        dailyPlay: "Play today's 10 questions",
        dailyDone:
          "Today's challenge is complete. Come back tomorrow for a new set.",
        challengeRun: "Challenge Run",
        classJoin: "Join a class challenge",
        classStart: "Start a class challenge",
        stampBook: "Stamp book",
        stampsEarned: (n: number) => String(n) + " of 15 stamps collected",
        newStamp: "New stamp!",
        stampLocked: "Keep practising to collect this stamp.",
        stampDefinitions: [
          {
            id: "first-steps",
            name: "First Steps",
            condition: "Finish any world level.",
          },
          {
            id: "below-zero",
            name: "Below Zero",
            condition: "Recover from a negative score and finish above zero.",
          },
          {
            id: "zero-hero",
            name: "Zero Hero",
            condition: "Give 5 correct answers equal to 0.",
          },
          {
            id: "going-up",
            name: "Going Up",
            condition: "Lift Rush: 10 correct passengers in a row.",
          },
          {
            id: "sign-sniper",
            name: "Sign Sniper",
            condition: "Sign Snap: 20 correct cards in a row.",
          },
          {
            id: "hop-master",
            name: "Hop Master",
            condition: "Earn 3 stars on 10 Target Hop puzzles.",
          },
          {
            id: "island-explorer",
            name: "Island Explorer",
            condition: "Earn 3 stars on all three Hop Island levels.",
          },
          {
            id: "order-keeper",
            name: "Order Keeper",
            condition: "Make 10 correct first-operation choices in a row.",
          },
          {
            id: "red-pen-hero",
            name: "Red Pen Hero",
            condition: "Find 15 mistakes in Red Pen HQ.",
          },
          {
            id: "perfect-page",
            name: "Perfect Page",
            condition:
              "Answer every question correctly in a Challenge Run of 10 or more.",
          },
          {
            id: "five-day-streak",
            name: "Five-Day Streak",
            condition: "Complete the daily challenge on 5 days in a row.",
          },
          {
            id: "quest-complete",
            name: "Quest Complete",
            condition: "Collect all 54 quest stars.",
          },
          {
            id: "class-challenger",
            name: "Class Challenger",
            condition: "Take part in a class challenge.",
          },
          {
            id: "podium",
            name: "Podium",
            condition: "Finish in the top 3 of a class challenge.",
          },
          {
            id: "most-improved",
            name: "Most Improved",
            condition: "Improve by at least 30 points in homework.",
          },
        ],
        signSnap: {
          title: "Sign Snap",
          intro:
            "Send each card to its place on the number line. Left is negative; right is positive. A zero factor gives zero.",
          instruction:
            "Swipe left or press ← for negative. Swipe right or press → for positive. Press ↓ or 0 for zero.",
          negative: "← Negative",
          positive: "Positive →",
          zero: "0 Zero",
          bonus: "Bonus card: give the exact value too.",
          value: "Exact value",
          submitBonus: "Check bonus card",
          right: "Yes! The card goes to the right place.",
          wrong: (sign: string) =>
            "This card is " +
            sign +
            ". Count the negative factors; an odd number gives a negative result.",
          zeroHint:
            "A zero factor makes the whole result 0, even with other signs.",
          bonusHint: (value: string) =>
            "The signs are right. Work from left to right for the value: " +
            value +
            ".",
          next: "Next card",
          finish: "Sign Snap complete",
          stars:
            "Timed stars need 10, 18 or 25 correct. Relaxed stars use accuracy.",
          pace: (n: number) => "Pace " + n,
        },
        targetHop: {
          title: "Target Hop",
          intro:
            "Play each move card once. Land exactly on the flag. There is no timer.",
          puzzle: (n: number) => "Puzzle " + n + " of 10",
          start: (n: string) => "Start at " + n,
          target: (n: string) => "Flag at " + n,
          current: (n: string) => "Now at " + n,
          card: (n: string) => "Move " + n,
          undo: "Undo",
          resetPuzzle: "Reset puzzle",
          hint: "Hint: one shortest first move",
          hintCard: (n: string) => "Try " + n + " first.",
          showSolution: "Show solution",
          outOfRange:
            "That card would hop past the end of the line. Try another card.",
          noCards:
            "Those cards did not reach the flag. Undo a move or show the solution.",
          success: (n: number) =>
            n === 3
              ? "Shortest route! Three stars."
              : n === 2
                ? "You reached the flag within par. Two stars."
                : "You reached the flag. One star.",
          next: "Next puzzle",
          finish: "Hop Island complete",
          cardsUsed: (used: number, par: number, minimum: number) =>
            used + " cards used · par " + par + " · shortest " + minimum,
          solution: (moves: string) => "One shortest route: " + moves,
          line: "Number line from −12 to +12, with a start star and target flag",
          noTimer: "Take your time. This puzzle has no timer.",
          levelStars:
            "Level stars reflect how many of the ten puzzles you solved within par.",
        },
        redPen: {
          title: "Red Pen Hero",
          intro:
            "Read the working. Tap the wrong line, then choose why it is wrong. Some pages are all correct.",
          page: (n: number) => "Page " + n + " of 5",
          boss: "Boss page: find two mistakes",
          pens: (n: number) => n + " red pens left",
          line: (n: number) => "Line " + n,
          allCorrect: "All correct!",
          chooseReason: "Why is this line wrong?",
          right: "Good catch! Here is the corrected line.",
          wrongLine:
            "That line is not the mistake. Look again and check the signs.",
          wrongReason:
            "That is not the reason. Read the operation signs again.",
          clean: "Every line on this page is correct.",
          more: "There is another mistake on this boss page.",
          next: "Next page",
          finish: "Red Pen Hero complete",
          checkSigns: "Check the operation signs before writing the answer.",
          twoPieces: "Two pieces of working. Find both mistakes.",
          showMe: "Show me the full working",
          reasons: {
            "neg-plus-neg-positive": "Adding two negatives stays negative.",
            "keep-first-sign":
              "Compare sizes; keep the sign of the larger size.",
            "minus-minus-unchanged": "Subtracting a negative becomes adding.",
            "reversed-subtraction": "Subtraction must stay in the given order.",
            "product-read-as-difference":
              "Touching brackets mean multiplication.",
            "chain-multiplied": "These signs say subtract, not multiply.",
            "mult-div-right-to-left": "Multiply and divide from left to right.",
            "bracket-minus-partial": "Subtract every term inside the bracket.",
            "odd-negatives-positive":
              "An odd number of negative factors gives a negative result.",
            "negatives-compared-by-size":
              "Further left on the number line means smaller.",
            "add-before-multiply": "Multiply before adding or subtracting.",
          },
        },
        settings: "Settings",
        back: "Back to the quest",
        play: "Play",
        close: "Close",
        avatar: "Avatar",
        nickname: "Nickname",
        frame: "Avatar frame",
        stampInk: "Stamp ink",
        inkNames: {
          crimson: "Red pen",
          navy: "Navy",
          bronze: "Bronze",
          gold: "Gold",
        },
        certificateTitle: "Quest complete",
        certificateBody: (name: string) =>
          name + " collected all 54 stars in Number Line Quest.",
        certificateNote: "You can take a screenshot of this certificate.",
        sound: "Sound",
        vibration: "Vibration",
        relaxed: "Relaxed mode — no timer",
        reduceMotion: "Reduce motion",
        settingsNote:
          "Sound and vibration are optional. Your choices and progress stay on this device.",
        reset: "Reset my progress",
        resetAsk: "Remove your stars, XP and daily streak from this device?",
        resetYes: "Yes, reset progress",
        cancel: "Cancel",
        chooseSkills: "Choose skills",
        chooseLevel: "Difficulty level",
        chooseCount: "Questions",
        setCode: "Set code",
        setCodeHelp:
          "Use the same code to get the same questions. Enter an eight-character code, or make a new set below.",
        useCode: "Use this code",
        makeSet: "Make a set",
        invalidCode:
          "That set code does not match a question set. Check the eight characters.",
        chooseSkill: "Choose at least one skill.",
        startRun: "Start run",
        score: "Score",
        question: (n: number, count: number) => `Question ${n} of ${count}`,
        time: "Time left",
        timeSeconds: (n: number) => `Time left: ${n} seconds`,
        starsOutOf: (n: number, total: number) => `${n} of ${total} stars`,
        scoreStreak: (value: string) => `streak (${value})`,
        scoreSpeed: (value: string) => `speed (${value})`,
        streakLabel: (n: number) => `Streak ×${n}`,
        onRoll: "On a roll!",
        answer: "Your answer",
        first: "What should you do first?",
        check: "Check answer",
        skip: "Skip",
        next: "Next question",
        showMe: "Show me",
        correct: "Nice work! +10",
        wrong: "Not quite. Mistakes help us learn.",
        skipped: "Skipped. Let's see how this one works.",
        wrongSign: "So close. Check the sign, then try the size.",
        wrongOrder: "Multiply or divide before adding or subtracting.",
        firstStepWrong: "The first step matters too. ",
        bracketFirst:
          "Work inside the brackets before using the result outside.",
        compareHint: "On the number line, the number further right is greater.",
        orderHint:
          "Start with the leftmost value. For negatives, the one further from zero is smaller.",
        zeroHint: "A zero factor makes the whole product zero.",
        fractionHint:
          "Check the sign first, then work out the fraction exactly.",
        correctAnswer: (answer: string) => `The answer is ${answer}.`,
        review: "Review answers",
        tryAgain: "Try again",
        nextLevel: "Next level",
        complete: "Run complete",
        personalBest: "Personal best!",
        newRank: "New rank!",
        earned: (n: number) => `${n ? `+${n}` : "0"} XP earned`,
        scoreWorking: "Score as directed numbers",
        timed: "Timed",
        untimed: "No timer",
        liftIntro:
          "A passenger gives a sum. Tap the floor where the lift will stop.",
        liftInstruction:
          "Use ↑ and ↓ to choose a floor, then Enter. Or tap a floor.",
        liftPassenger: "Passenger says",
        liftTitle: "Lift Rush",
        liftPosition: (floor: string) =>
          `Lift car at ${floor}; destination between B5 and 10/F`,
        lineDescription: (min: number, max: number) =>
          `Number line from ${min} to ${max}, with A at one tick`,
        threeStars: "3 stars",
        liftFloor: (n: string) => `Floor ${n}`,
        liftSelected: "Selected floor",
        liftRight: "The passenger gets off here. Nice journey!",
        liftWrong: (floor: string) =>
          `The lift stops at ${floor}. Read the operation sign and the number's sign, then count the floors.`,
        liftNext: "Next passenger",
        liftStars:
          "Timed stars need 8, 12 or 16 correct. Relaxed stars use accuracy.",
        liftFinish: "Lift Rush complete",
        keypad: "Show keypad",
        hideKeypad: "Hide keypad",
        misconceptionNotes: {
          "neg-plus-neg-positive":
            "Adding two negative numbers moves left twice. The result stays negative.",
          "keep-first-sign":
            "For opposite signs, compare the sizes. Keep the sign of the number with the larger size.",
          "minus-minus-unchanged":
            "Subtracting a negative turns into adding its positive opposite.",
          "reversed-subtraction":
            "Subtraction has an order. Start at the first number and move left.",
          "product-read-as-difference":
            "These brackets touch, so multiply. Two negative factors give a positive product.",
          "chain-multiplied":
            "The signs between these numbers mean subtract, not multiply.",
          "mult-div-right-to-left":
            "Multiply and divide are at the same level. Work from left to right.",
          "bracket-minus-partial":
            "Subtract the whole bracket. Both terms inside change sign when it opens.",
          "odd-negatives-positive":
            "Count every negative factor. An odd number gives a negative product.",
          "negatives-compared-by-size":
            "Of two negative numbers, the one further left is smaller.",
          "add-before-multiply": "Multiply first, then add or subtract.",
        },
      },
      returnToLesson: "Open Add & subtract",
      intro:
        "Start at the first number. Choose a direction, count the steps and see where you land.",
      bird: {
        playAnimation: "Play animation",
        pauseAnimation: "Pause animation",
        replayAnimation: "Replay animation",
        signSequence: "Read the signs, then walk the magnitude",
        startLabel: "Start",
        operationLabel: "Operation sign",
        signLabel: "Number sign",
        magnitudeLabel: "Magnitude",
        walked: (steps: number, total: number) =>
          `${steps} / ${total} units walked`,
        toggle: "Show the bird method",
        title: "Follow the bird",
        examples: "Try these examples",
        exampleOne: "+3 + (−7)",
        exampleTwo: "−2 − (−4)",
        exampleThree: "+3 − (−5)",
        startNote:
          "The first number only tells us where to start, even if it is negative. The bird begins facing right.",
        start: (value: string) =>
          `1. Start: put the bird at ${value}, facing right.`,
        firstPending: (op: string) =>
          `2. Operation sign ${op}: turn around if it is minus.`,
        first: (op: string, turns: boolean, side: string) =>
          turns
            ? `2. Operation sign ${op}: turn once, from right to ${side}.`
            : `2. Operation sign ${op}: no turn; keep facing ${side}.`,
        secondPending: (value: string) =>
          `3. Second number ${value}: turn around if its sign is minus.`,
        second: (
          value: string,
          turns: boolean,
          turnedBefore: boolean,
          side: string,
        ) =>
          turns
            ? `3. Second number ${value}: turn ${turnedBefore ? "again" : "once"} to face ${side}.`
            : `3. Second number ${value}: no turn; keep facing ${side}.`,
        walkPending: "4. Walk: read both signs before moving.",
        walk: (count: number) =>
          `4. Walk: take ${count} ${count === 1 ? "step" : "steps"} forwards.`,
        land: (side: string, value: string) =>
          `The bird travels ${side} and lands at ${value}.`,
        zeroLand: (value: string) =>
          `The bird does not move. It stays at ${value}.`,
        ready: "Begin facing right. Read the operation sign first.",
        afterFirst: (side: string) =>
          `The bird now faces ${side}. Read the second number's sign next.`,
        firstQuestion: "After the operation sign, which way does it face?",
        secondQuestion: "After the second sign, which way does it face?",
        firstWrong: (op: string, side: string) =>
          op === "−"
            ? `The minus sign turns it once: right to ${side}.`
            : `A plus sign means no turn. It still faces ${side}.`,
        secondWrong: (
          value: string,
          from: string,
          to: string,
          turnedBefore: boolean,
        ) =>
          value.startsWith("−")
            ? `The minus sign on the second number turns it ${turnedBefore ? "again" : "once"}: ${from} to ${to}.`
            : `There is no second minus sign, so it keeps facing ${to}.`,
        travelHint: (turns: number, facing: string, travel: string) =>
          `${turns === 0 ? "No minus signs: no turns" : turns === 1 ? "One minus sign: one turn" : "Two minus signs: two turns"}. Now facing ${facing}, it walks forwards to the ${travel}.`,
        zero: "The second number is 0, so the bird stays where it started.",
        zeroStep: "4. Walk: 0 steps, so the bird stays where it started.",
        readOperation: "Read the operation sign",
        readNumber: "Read the second sign",
      },
      lesson: "Explore the movement",
      scrollLine: "Swipe the number line to see more.",
      working: "Working",
      rule: "Which way?",
      positive: "Positive number",
      negative: "Negative number",
      add: "Add",
      subtract: "Subtract",
      left: "Left",
      right: "Right",
      up: "Up",
      down: "Down",
      speechNumber: (n: number, d: number) =>
        `${n < 0 ? "minus " : ""}${Math.abs(n)}${d === 1 ? "" : ` over ${d}`}`,
      verticalHint: (text: string) =>
        text.replaceAll("left", "down").replaceAll("right", "up"),
      temperatureSentence: (
        start: string,
        distance: number,
        up: boolean,
        end: string,
      ) =>
        `Start at ${start} °C. The temperature ${up ? "rises" : "drops"} by ${distance} °C. It reaches ${end} °C.`,
      liftSentence: (
        start: string,
        distance: number,
        up: boolean,
        end: string,
      ) =>
        `Start at ${start}. Go ${up ? "up" : "down"} ${distance} ${distance === 1 ? "floor" : "floors"}. Stop at ${end}.`,
      none: "Stay here",
      start: "Starting number",
      operation: "Operation",
      amount: "Signed number",
      apply: "Use these numbers",
      expression: "Your expression",
      echo: "Read as",
      load: "Show on number line",
      keypad: "Keypad",
      clear: "Clear",
      backspace: "Delete last character",
      enter: "Enter",
      fraction: "a/b",
      space: "Space",
      showKeypad: "Show keypad",
      hideKeypad: "Hide keypad",
      predict: "Predict first",
      directionQuestion: "Which way will we move?",
      checkDirection: "Check direction",
      directionRight: "Yes — that is the direction.",
      directionHint: (op: string, b: string, direction: string) =>
        `${op} ${b}: move ${direction}.`,
      directionZero: "Moving 0 units leaves you where you started.",
      subtractNegative:
        "Adding a negative moves left. Subtracting it reverses the move: go right.",
      subtractPositive:
        "Adding a positive moves right. Subtracting it reverses the move: go left.",
      addNegative: "Adding a negative moves left, towards smaller numbers.",
      addPositive: "Adding a positive moves right, towards greater numbers.",
      distanceQuestion: "How many units will we move?",
      distanceHint: (n: number) =>
        `Count the distance: ${n} ${n === 1 ? "unit" : "units"}. The sign tells us the direction.`,
      distanceRight: "Yes — that is the distance.",
      landingQuestion: "Where will we land?",
      check: "Check",
      optional: "You can predict the landing point, or reveal the movement.",
      correctLanding: "Yes — you found the landing point!",
      wrongLanding: "Let's check the movement together.",
      build: "Build the jump",
      showMe: "Show me",
      retry: "Try this step again",
      similar: "Try a similar question",
      next: "Next",
      reveal: "Reveal direction",
      back: "Back",
      newExample: "New example",
      reset: "Restart",
      nextMove: "Predict the next move",
      finish: "Journey complete",
      progress: (n: number, total: number) => `Step ${n} of ${total}`,
      journeyProgress: (n: number, total: number) => `Move ${n} of ${total}`,
      units: "units",
      origin: "Start",
      result: "Finish",
      now: "Now",
      sentence: (
        a: string,
        operation: string,
        b: string,
        distance: number,
        direction: string,
        end: string,
      ) =>
        `Start at ${a}. ${operation} ${b} means moving ${distance} ${distance === 1 ? "unit" : "units"} ${direction}. We land on ${end}.`,
      zeroSentence: (a: string) =>
        `Start at ${a}. Moving 0 units leaves us at ${a}.`,
      adding: "Adding",
      subtracting: "Subtracting",
      partial: (a: string, end: string, count: number) =>
        `Start at ${a}. ${count} ${count === 1 ? "hop" : "hops"} shown. Now at ${end}.`,
      waiting: (a: string) =>
        `Start at ${a}. Predict the direction before revealing the movement.`,
      sameMove: "Same move, two ways",
      sameExplanation: "Both expressions make the same movement.",
      change: "Change one thing",
      changeHelp:
        "Change just the operation or the sign. Predict what happens before you reveal it.",
      flipOperation: "Change + / −",
      flipSign: "Change the number's sign",
      before: "Before",
      after: "Now try",
      skin: "Picture",
      plain: "Number line",
      thermometer: "Thermometer",
      lift: "Lift",
      chain: "Try a journey with three moves",
      chainHint: "You can type up to four moves in one expression.",
      think: "Think about it",
      thinkQuestion: "What happens when you add a number to its opposite?",
      thinkAnswer:
        "You return to 0: the two numbers are the same distance from 0 on opposite sides.",
      revealAnswer: "Reveal answer",
      hideAnswer: "Hide answer",
      nextTopic: "Next: Removing brackets",
      matchingWorld: "Practise in Lift Rush",
      keys: "Keys",
      keyHelp:
        "→ / PageDown / Space: next · ← / PageUp: back · R: reveal · N: new · P: predict. Shortcuts work when the app has focus and you are not typing.",
      tip: "One step at a time",
      ready: "Ready to explore",
      arrow: (way: string) => `Movement: ${way}`,
      floor: (n: number) =>
        n < 0 ? `B${Math.abs(n)}` : n === 0 ? "G" : `${n}/F`,
      temperature: (n: string) => `${n} °C`,
      errors: {
        additiveOnly:
          "Use addition and subtraction with up to five terms for this lesson.",
        divisionByZero: "You can't divide by 0.",
        overflow: "These numbers are too large. Try smaller numbers.",
        invalidNumber: "Enter a number, such as −3, 0.5 or −1 1/2.",
        signedOperand:
          "Put a signed number in brackets after an operation sign: 3 × (−2).",
        emptyBrackets: "Put a number inside the brackets.",
        brackets:
          "Check that every opening bracket has a matching closing bracket.",
        missingNumber: "Add the missing number to finish your expression.",
        unknown: "Check this part. Use numbers, operation signs and brackets.",
        ambiguousFraction: "Use ÷ or brackets to make this clear: (6/2) ÷ 3.",
        tooLong: "Keep your expression to 80 characters or fewer.",
        journey:
          "Use a starting integer from −20 to +20 and one to four + or − moves. Each move must be an integer from −20 to +20.",
      },
    },
    title: "Web apps",
    intro:
      "Interactive tools for teaching and revision. Every app works on a phone and has a projection mode for the classroom.",
    empty: "No apps match those filters yet.",
    filterLevel: "Level",
    filterStrand: "Strand",
    filterTopic: "Textbook topic",
    allTopics: "All textbook topics",
    emptyTopic: "No web apps for this textbook topic yet.",
    search: "Search apps",
    presentation: "Projection mode",
    exitPresentation: "Leave projection mode",
    hidden: "Hidden",
    unavailable: "This app isn't available right now.",
    allLevels: "All levels",
    allStrands: "All strands",
    openApp: "Open app",
    backToApps: "All web apps",
    loading: "Loading app…",
    checkingAvailability: "Checking app availability…",
    settingsFailed: "Could not load app settings. Please try again.",
    editListing: "Edit listing",
    featured: "Featured",
    visible: "Visible to visitors",
    moveUp: "Move up",
    moveDown: "Move down",
    dragToReorder: "Drag to reorder",
    clearFiltersToReorder: "Clear filters to reorder the app list.",
    reorderWithinGroup:
      "Move featured apps among featured apps, or turn off Featured first.",
    hiddenTeacher: "Hidden from visitors",
    listingTitle: "Listing title (leave blank for the default)",
    listingSummary: "Listing summary (leave blank for the default)",
    resultCount: (count: number) =>
      `${count} ${count === 1 ? "app" : "apps"} found`,
    quadratic: {
      title: "Quadratic explorer",
      topic: "Quadratic Functions and their Graphs",
      summary:
        "Change the coefficients and see how the curve, vertex and roots respond.",
      intro: "Move the sliders to reshape the graph.",
      coefficient: (name: string) => `Coefficient ${name}`,
      graphLabel: "Graph of the quadratic function",
      vertex: "Vertex",
      axis: "Axis of symmetry",
      discriminant: "Discriminant",
      roots: "Roots",
      oneRoot: "One repeated root",
      noRealRoots: "No real roots",
    },
    unitCircle: {
      title: "Unit circle",
      topic: "Trigonometric Functions and their Graphs",
      summary:
        "Drag a point around the circle to explore sine, cosine, tangent and their signs.",
      intro: "Drag the point, use the arrow keys, or move the angle slider.",
      graphLabel:
        "Unit circle with a draggable point and sine and cosine projections",
      pointLabel: "Point on the unit circle",
      angle: "Angle",
      sine: "sin θ",
      cosine: "cos θ",
      tangent: "tan θ",
      undefined: "Undefined",
      quadrant: "Quadrant",
      onAxis: "On an axis",
      signs: "Signs",
    },
    inequality: {
      title: "Inequality number line",
      topic: "Linear Inequalities in One Unknown",
      summary:
        "Solve linear or compound inequalities and see open and closed endpoints.",
      intro:
        "Enter an inequality, then follow the steps and inspect its number line.",
      input: "Inequality",
      solve: "Solve",
      exampleSimple: "Try 2x - 3 > 5",
      exampleCompound: "Try -1 ≤ x < 4",
      sampleSimple: "2x - 3 > 5",
      sampleCompound: "-1 ≤ x < 4",
      invalid:
        "Enter a linear inequality such as 2x - 3 > 5, or a compound inequality such as -1 ≤ x < 4.",
      noSolution: "No values satisfy these bounds.",
      steps: "Working",
      solution: "Solution",
      subtractConstant: "Move the constant term",
      divideCoefficient: "Divide by the coefficient",
      reverseSign:
        "The inequality sign reverses when dividing by a negative number.",
      compoundStep: "Keep the values between the two bounds.",
      numberLine: "Solution shown on a number line",
      openDot: "Open dot: endpoint excluded",
      closedDot: "Closed dot: endpoint included",
    },
  },

  editor: {
    edit: (label: string) => `Edit ${label.toLowerCase()}`,
    save: "Save",
    cancel: "Cancel",
    saved: "Saved",
    saveFailed: "Could not save. Check your connection and try again.",
    invalid: "Enter valid text within the length limit.",
    invalidLink: "Use an https:// link or a path beginning with /.",
    lastEdited: (by: string, when: string) => `Last edited by ${by} on ${when}`,
    neverEdited: "Using the default text.",
    loading: "Loading editable content…",
    loadFailed: "Could not load the latest content.",
    booksHint:
      "Use Manage Books and Manage Topics to edit Mistakes Book content.",
  },

  books: {
    title: "Mistakes book",
    detailTitle: "Mistakes Book preview",
    intro:
      "Correction notes by level and topic. Teachers can also see the teacher edition.",
    empty: "No books for this topic yet. Teachers can upload one from Manage.",
    chooseLevel: "Choose a level",
    chooseTopic: "Choose a topic to see its books.",
    topicsTitle: "Topics",
    booksTitle: "Books",
    noTopics: "No topics are available for this level yet.",
    loading: "Loading books…",
    loadFailed: "Could not load books. Check your connection and try again.",
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
    signInFailed: "Sign-in failed. Check your connection and try again.",
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
    loading: "Loading teachers…",
    loadFailed:
      "Could not load the teacher list. Check your connection and try again.",
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
    loadFailed: "Could not load topics. Check your connection and try again.",
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
