import type { CourseDay } from "@/lib/types";

/**
 * Dr. Angela Yu's 100 Days of Code, as a tracker.
 *
 * This is the course's structure only - section titles, lecture counts and run
 * times, all of which are facts about the course. None of the course's own
 * content is reproduced here: you watch the lectures on Udemy and come back to
 * record what you did. Each day also carries a practice project of my own,
 * deliberately different from the course's built-in build for that day.
 */
export const courseDays: CourseDay[] = [
  {
    day: 1,
    section: 1,
    title: "Working with Variables in Python to Manage Data",
    track: "Beginner",
    lectures: 16,
    minutes: 72,
    project: {
      title: "Mad Libs generator",
      brief:
        "Prompt for a handful of words, slot them into a story template, print the result. Practises input(), string concatenation and f-strings.",
    },
  },
  {
    day: 2,
    section: 2,
    title: "Understanding Data Types and How to Manipulate Strings",
    track: "Beginner",
    lectures: 10,
    minutes: 58,
    project: {
      title: "Username & initials builder",
      brief:
        "Take a full name and produce a URL slug, initials, and a masked email like a•••@gmail.com. Pure string slicing and type conversion.",
    },
  },
  {
    day: 3,
    section: 3,
    title: "Control Flow and Logical Operators",
    track: "Beginner",
    lectures: 12,
    minutes: 75,
    project: {
      title: "Date validator",
      brief:
        "Given day, month and year, decide whether the date is real — including leap years. All branching, no libraries.",
    },
  },
  {
    day: 4,
    section: 4,
    title: "Randomisation and Python Lists",
    track: "Beginner",
    lectures: 8,
    minutes: 64,
    project: {
      title: "Dice statistics simulator",
      brief:
        "Roll two dice 10,000 times, tally every total, print a text histogram. Shows how random converges.",
    },
  },
  {
    day: 5,
    section: 5,
    title: "Python Loops",
    track: "Beginner",
    lectures: 7,
    minutes: 41,
    project: {
      title: "Collatz explorer",
      brief:
        "For any starting number, print the 3n+1 sequence and its length. Then find the longest chain under 1,000.",
    },
  },
  {
    day: 6,
    section: 6,
    title: "Python Functions & Karel",
    track: "Beginner",
    lectures: 10,
    minutes: 83,
    project: {
      title: "Refactor day 4",
      brief:
        "Rewrite your dice simulator as three small functions — roll, tally, render — with no repeated code.",
    },
  },
  {
    day: 7,
    section: 7,
    title: "Hangman",
    track: "Beginner",
    lectures: 8,
    minutes: 58,
    project: {
      title: "Category word guess",
      brief:
        "A guessing game where the word comes from a category you pick, with a score that drops per wrong guess.",
    },
  },
  {
    day: 8,
    section: 8,
    title: "Function Parameters & Caesar Cipher",
    track: "Beginner",
    lectures: 9,
    minutes: 65,
    project: {
      title: "Two-cipher toolkit",
      brief:
        "Add an Atbash cipher beside your Caesar one, and a single decode() that takes the cipher name as a parameter.",
    },
  },
  {
    day: 9,
    section: 9,
    title: "Dictionaries, Nesting and the Secret Auction",
    track: "Beginner",
    lectures: 7,
    minutes: 50,
    project: {
      title: "Nested gradebook",
      brief:
        "students → subjects → scores. Print each student's average and the best score per subject.",
    },
  },
  {
    day: 10,
    section: 10,
    title: "Functions with Outputs",
    track: "Beginner",
    lectures: 8,
    minutes: 55,
    project: {
      title: "Converter dispatcher",
      brief:
        "A dict mapping names to conversion functions, so convert('c_to_f', 100) works. Your first taste of functions as values.",
    },
  },
  {
    day: 11,
    section: 11,
    title: "The Blackjack Capstone Project",
    track: "Beginner",
    lectures: 8,
    minutes: 47,
    project: {
      title: "Reusable deck library",
      brief:
        "Pull deck, shuffle, deal and score into their own module you can import into later card games.",
    },
  },
  {
    day: 12,
    section: 12,
    title: "Scope & Number Guessing Game",
    track: "Beginner",
    lectures: 10,
    minutes: 49,
    project: {
      title: "Scope demonstration",
      brief:
        "Write the same score tracker twice — once with a global, once passing state through arguments. Note which you'd rather maintain.",
    },
  },
  {
    day: 13,
    section: 13,
    title: "Debugging: How to Find and Fix Errors in your Code",
    track: "Beginner",
    lectures: 11,
    minutes: 43,
    project: {
      title: "Break your own code",
      brief:
        "Write five inputs that break your day 9 gradebook, then fix each one. Keep the failing cases as a checklist.",
    },
  },
  {
    day: 14,
    section: 14,
    title: "Higher Lower Game Project",
    track: "Beginner",
    lectures: 3,
    minutes: 37,
    project: {
      title: "Top trumps",
      brief:
        "Build the same compare-two-things loop over a dataset you care about — programming languages, cities, anything.",
    },
  },
  {
    day: 15,
    section: 15,
    title: "Local Development Environment Setup & the Coffee Machine",
    track: "Intermediate",
    lectures: 3,
    minutes: 39,
    project: {
      title: "Vending machine",
      brief:
        "Inventory, coins in, correct change out, refuse politely when it cannot make change.",
    },
  },
  {
    day: 16,
    section: 16,
    title: "Object Oriented Programming (OOP)",
    track: "Intermediate",
    lectures: 9,
    minutes: 65,
    project: {
      title: "Bank account class",
      brief:
        "deposit, withdraw, overdraft rules and a transaction history list. Raise on an invalid withdrawal.",
    },
  },
  {
    day: 17,
    section: 17,
    title: "The Quiz Project & the Benefits of OOP",
    track: "Intermediate",
    lectures: 11,
    minutes: 63,
    project: {
      title: "Flashcard classes",
      brief:
        "Card, Deck and Session classes. Session tracks which cards you got wrong and re-queues them.",
    },
  },
  {
    day: 18,
    section: 18,
    title: "Turtle & the Graphical User Interface (GUI)",
    track: "Intermediate",
    lectures: 12,
    minutes: 88,
    project: {
      title: "Spirograph",
      brief:
        "Draw one with the number of circles, radius and colour set by parameters at the top of the file.",
    },
  },
  {
    day: 19,
    section: 19,
    title: "Instances, State and Higher Order Functions",
    track: "Intermediate",
    lectures: 8,
    minutes: 45,
    project: {
      title: "Turtle race, refactored",
      brief:
        "Build the race, then rewrite the setup loop using a list comprehension and a function passed as an argument.",
    },
  },
  {
    day: 20,
    section: 20,
    title: "Build the Snake Game Part 1: Animation & Coordinates",
    track: "Intermediate",
    lectures: 6,
    minutes: 51,
    project: {
      title: "Etch-a-sketch",
      brief:
        "Arrow keys move a turtle and draw. Space clears. Same event-binding idea, smaller surface.",
    },
  },
  {
    day: 21,
    section: 21,
    title: "Build the Snake Game Part 2: Inheritance & List Slicing",
    track: "Intermediate",
    lectures: 9,
    minutes: 50,
    project: {
      title: "Snake levels",
      brief:
        "Add a speed increase every five points and a high score that survives a restart.",
    },
  },
  {
    day: 22,
    section: 22,
    title: "Build Pong: The Famous Arcade Game",
    track: "Intermediate",
    lectures: 10,
    minutes: 53,
    project: {
      title: "Breakout",
      brief:
        "Same paddle and collision logic, but with a wall of bricks to clear.",
    },
  },
  {
    day: 23,
    section: 23,
    title: "The Turtle Crossing Capstone Project",
    track: "Intermediate",
    lectures: 11,
    minutes: 38,
    project: {
      title: "Timed Frogger",
      brief:
        "Add a countdown timer and a lives counter to the crossing game.",
    },
  },
  {
    day: 24,
    section: 24,
    title: "Files, Directories and Paths",
    track: "Intermediate",
    lectures: 9,
    minutes: 63,
    project: {
      title: "Bulk renamer",
      brief:
        "Rename every file in a folder to a pattern, with a --dry-run flag that prints instead of renaming.",
    },
  },
  {
    day: 25,
    section: 25,
    title: "Working with CSV Data and the Pandas Library",
    track: "Intermediate",
    lectures: 7,
    minutes: 75,
    project: {
      title: "Analyse your own log",
      brief:
        "Export your hours from this platform's Settings page and answer: which week was heaviest, and which domain got the most time?",
    },
  },
  {
    day: 26,
    section: 26,
    title: "List Comprehension and the NATO Alphabet",
    track: "Intermediate",
    lectures: 12,
    minutes: 45,
    project: {
      title: "Text stats in one-liners",
      brief:
        "Word frequency, longest word and unique-word ratio, each as a single comprehension.",
    },
  },
  {
    day: 27,
    section: 27,
    title: "Tkinter, *args, **kwargs and Creating GUI Programs",
    track: "Intermediate",
    lectures: 12,
    minutes: 78,
    project: {
      title: "Converter GUI",
      brief:
        "A window with a dropdown of unit types and a live-updating result field.",
    },
  },
  {
    day: 28,
    section: 28,
    title: "Tkinter, Dynamic Typing and the Pomodoro GUI Application",
    track: "Intermediate",
    lectures: 7,
    minutes: 69,
    project: {
      title: "Pomodoro with a log",
      brief:
        "Append every completed session to a CSV and show today's total in the window.",
    },
  },
  {
    day: 29,
    section: 29,
    title: "Building a Password Manager GUI App with Tkinter",
    track: "Intermediate",
    lectures: 7,
    minutes: 55,
    project: {
      title: "Strength meter",
      brief:
        "Add a search box and a password strength indicator that updates as you type.",
    },
  },
  {
    day: 30,
    section: 30,
    title: "Errors, Exceptions and JSON Data: Improving the Password Manager",
    track: "Intermediate",
    lectures: 9,
    minutes: 65,
    project: {
      title: "Strict config loader",
      brief:
        "Read a JSON config, validate every field, and fail with a message naming exactly what is wrong.",
    },
  },
  {
    day: 31,
    section: 31,
    title: "Flash Card App Capstone Project",
    track: "Intermediate",
    lectures: 9,
    minutes: 51,
    project: {
      title: "Leitner boxes",
      brief:
        "Add spaced repetition — cards you get right move up a box, wrong sends them back to box one.",
    },
  },
  {
    day: 32,
    section: 32,
    title: "Send Email (smtplib) & Manage Dates (datetime)",
    track: "Intermediate+",
    lectures: 9,
    minutes: 66,
    project: {
      title: "Deadline reminder",
      brief:
        "Email yourself a week before any internship deadline in a CSV you maintain.",
    },
  },
  {
    day: 33,
    section: 33,
    title: "API Endpoints & API Parameters - ISS Overhead Notifier",
    track: "Intermediate+",
    lectures: 7,
    minutes: 52,
    project: {
      title: "Currency converter CLI",
      brief:
        "Hit a public FX API and convert between any two currencies from the command line.",
    },
  },
  {
    day: 34,
    section: 34,
    title: "API Practice - Creating a GUI Quiz App",
    track: "Intermediate+",
    lectures: 9,
    minutes: 55,
    project: {
      title: "Trivia with categories",
      brief:
        "Add a category picker and a running scoreboard to the quiz.",
    },
  },
  {
    day: 35,
    section: 35,
    title: "Keys, Authentication & Environment Variables: Send SMS",
    track: "Intermediate+",
    lectures: 9,
    minutes: 68,
    project: {
      title: "Secrets done right",
      brief:
        "A weather alert that reads its key from .env, with .env in .gitignore. Verify nothing leaked with git log -p.",
    },
  },
  {
    day: 36,
    section: 36,
    title: "Stock Trading News Alert Project",
    track: "Intermediate+",
    lectures: 5,
    minutes: 40,
    project: {
      title: "Crypto mover alert",
      brief:
        "Same idea for a crypto pair — alert when the 24h move exceeds a threshold you set.",
    },
  },
  {
    day: 37,
    section: 37,
    title: "Habit Tracking Project: API Post Requests & Headers",
    track: "Intermediate+",
    lectures: 6,
    minutes: 39,
    project: {
      title: "Study hours logger",
      brief:
        "POST your daily study hours somewhere and read them back as a streak.",
    },
  },
  {
    day: 38,
    section: 38,
    title: "Workout Tracking Using Google Sheets",
    track: "Intermediate+",
    lectures: 7,
    minutes: 8,
    project: {
      title: "Expense logger",
      brief:
        "Natural-language spend entry that appends a row to a Sheet.",
    },
  },
  {
    day: 39,
    section: 39,
    title: "Capstone Part 1: Flight Deal Finder",
    track: "Intermediate+",
    lectures: 7,
    minutes: 16,
    project: {
      title: "Price watcher skeleton",
      brief:
        "The reusable half: a watcher that polls any price endpoint and records history.",
    },
  },
  {
    day: 40,
    section: 40,
    title: "Capstone Part 2: Flight Club",
    track: "Intermediate+",
    lectures: 6,
    minutes: 8,
    project: {
      title: "Weekly digest",
      brief:
        "Email yourself one summary of the week's findings instead of an alert per event.",
    },
  },
  {
    day: 41,
    section: 41,
    title: "Introduction to HTML",
    track: "Web Foundation",
    lectures: 8,
    minutes: 58,
    project: {
      title: "Semantic resume",
      brief:
        "Your CV as one HTML page using only semantic tags. No styling yet, no divs.",
    },
  },
  {
    day: 42,
    section: 42,
    title: "Intermediate HTML",
    track: "Web Foundation",
    lectures: 6,
    minutes: 61,
    project: {
      title: "Add structure",
      brief:
        "Give the resume a skills table and a contact form that validates in the browser.",
    },
  },
  {
    day: 43,
    section: 43,
    title: "Introduction to CSS",
    track: "Web Foundation",
    lectures: 5,
    minutes: 56,
    project: {
      title: "Colour system",
      brief:
        "Style the resume from a palette of five CSS custom properties, nothing hard-coded.",
    },
  },
  {
    day: 44,
    section: 44,
    title: "Intermediate CSS",
    track: "Web Foundation",
    lectures: 5,
    minutes: 69,
    project: {
      title: "Make it responsive",
      brief:
        "Flexbox layout that works at 375px and 1440px with no horizontal scroll.",
    },
  },
  {
    day: 45,
    section: 45,
    title: "Web Scraping with Beautiful Soup",
    track: "Intermediate+",
    lectures: 7,
    minutes: 64,
    project: {
      title: "Hacker News scraper",
      brief:
        "Pull the top 30 titles, points and links, sort by points, save to CSV.",
    },
  },
  {
    day: 46,
    section: 46,
    title: "Create a Spotify Playlist using the Musical Time Machine",
    track: "Intermediate+",
    lectures: 8,
    minutes: 11,
    project: {
      title: "Playlist from your own data",
      brief:
        "Build a playlist from a CSV of tracks you assemble yourself.",
    },
  },
  {
    day: 47,
    section: 47,
    title: "Create an Automated Amazon Price Tracker",
    track: "Intermediate+",
    lectures: 5,
    minutes: 10,
    project: {
      title: "Textbook watcher",
      brief:
        "Track one textbook you actually need and email on a price drop.",
    },
  },
  {
    day: 48,
    section: 48,
    title: "Selenium Webdriver Browser and Game Playing Bot",
    track: "Intermediate+",
    lectures: 8,
    minutes: 54,
    project: {
      title: "Form filler",
      brief:
        "Fill a practice form, submit it, screenshot the confirmation. Respect robots.txt.",
    },
  },
  {
    day: 49,
    section: 49,
    title: "Automating your Exercise Routine at the Gym",
    track: "Intermediate+",
    lectures: 10,
    minutes: 13,
    project: {
      title: "Dry-run booker",
      brief:
        "Script a library room booking that stops before submitting. Automate reading, not clicking.",
    },
  },
  {
    day: 50,
    section: 50,
    title: "Auto Tinder Swiping Bot",
    track: "Intermediate+",
    lectures: 6,
    minutes: 11,
    project: {
      title: "Link checker instead",
      brief:
        "Point Selenium at your own deployed site and report every broken link.",
    },
  },
  {
    day: 51,
    section: 51,
    title: "Internet Speed X Complaint Bot",
    track: "Intermediate+",
    lectures: 5,
    minutes: 8,
    project: {
      title: "Speed logger",
      brief:
        "Log your connection speed hourly to CSV, then chart a week of it.",
    },
  },
  {
    day: 52,
    section: 52,
    title: "Instagram Follower Bot",
    track: "Intermediate+",
    lectures: 6,
    minutes: 7,
    project: {
      title: "GitHub analyser",
      brief:
        "Use the public GitHub API to list who follows you back and who does not.",
    },
  },
  {
    day: 53,
    section: 53,
    title: "Web Scraping Capstone - Data Entry Job Automation",
    track: "Intermediate+",
    lectures: 3,
    minutes: 10,
    project: {
      title: "Scrape one job board",
      brief:
        "Pull internship postings from a single company's Greenhouse board into CSV.",
    },
  },
  {
    day: 54,
    section: 54,
    title: "Introduction to Web Development with Flask",
    track: "Intermediate+",
    lectures: 7,
    minutes: 57,
    project: {
      title: "Three routes",
      brief:
        "A Flask app with /, /about and /now returning the server time.",
    },
  },
  {
    day: 55,
    section: 55,
    title: "HTML & URL Parsing in Flask and the Higher Lower Game",
    track: "Intermediate+",
    lectures: 7,
    minutes: 33,
    project: {
      title: "URL shortener",
      brief:
        "POST a long URL, get a short code back, visiting the code redirects.",
    },
  },
  {
    day: 56,
    section: 56,
    title: "Rendering HTML/Static files and Using Website Templates",
    track: "Intermediate+",
    lectures: 6,
    minutes: 40,
    project: {
      title: "Serve your resume",
      brief:
        "Move the day 44 resume into Flask with proper static file handling.",
    },
  },
  {
    day: 57,
    section: 57,
    title: "Templating with Jinja in Flask Applications",
    track: "Intermediate+",
    lectures: 6,
    minutes: 38,
    project: {
      title: "Blog index",
      brief:
        "Loop over a list of post dicts to render an index and individual post pages.",
    },
  },
  {
    day: 58,
    section: 58,
    title: "Web Foundation Bootstrap",
    track: "Web Foundation",
    lectures: 5,
    minutes: 100,
    project: {
      title: "Rebuild with Bootstrap",
      brief:
        "Same resume, Bootstrap grid and components. Compare the CSS you had to write.",
    },
  },
  {
    day: 59,
    section: 59,
    title: "Blog Capstone Project Part 2 - Adding Styling",
    track: "Advanced",
    lectures: 8,
    minutes: 4,
    project: {
      title: "Dark mode",
      brief:
        "Add a theme toggle that remembers the choice.",
    },
  },
  {
    day: 60,
    section: 60,
    title: "Make POST Requests with Flask and HTML Forms",
    track: "Advanced",
    lectures: 6,
    minutes: 4,
    project: {
      title: "Contact form",
      brief:
        "Accept a POST and append the submission to a file with a timestamp.",
    },
  },
  {
    day: 61,
    section: 61,
    title: "Building Advanced Forms with Flask-WTForms",
    track: "Advanced",
    lectures: 9,
    minutes: 11,
    project: {
      title: "Validated login",
      brief:
        "A login form with per-field error messages and CSRF protection on.",
    },
  },
  {
    day: 62,
    section: 62,
    title: "Flask, WTForms, Bootstrap and CSV - Coffee & Wifi Project",
    track: "Advanced",
    lectures: 3,
    minutes: 3,
    project: {
      title: "Study spot directory",
      brief:
        "Rate campus study spots on wifi, noise and power sockets.",
    },
  },
  {
    day: 63,
    section: 63,
    title: "Databases with SQLite and SQLAlchemy",
    track: "Advanced",
    lectures: 8,
    minutes: 12,
    project: {
      title: "Attempts database",
      brief:
        "Store every LeetCode attempt — problem, date, minutes, whether you solved it unaided.",
    },
  },
  {
    day: 64,
    section: 64,
    title: "My Top 10 Movies Website",
    track: "Advanced",
    lectures: 7,
    minutes: 7,
    project: {
      title: "Top 10 books",
      brief:
        "Same CRUD and ranking, different data. Add a re-rank by drag or by number.",
    },
  },
  {
    day: 65,
    section: 65,
    title: "Web Design School - How to Create a Website that People will Love",
    track: "Web Foundation",
    lectures: 6,
    minutes: 66,
    project: {
      title: "Redesign one page",
      brief:
        "Critique your own resume page against the lesson, then fix the three worst things.",
    },
  },
  {
    day: 66,
    section: 66,
    title: "Building Your Own API with RESTful Routing",
    track: "Advanced",
    lectures: 12,
    minutes: 23,
    project: {
      title: "API over your attempts",
      brief:
        "GET, POST, PATCH and DELETE on the day 63 database, with real status codes.",
    },
  },
  {
    day: 67,
    section: 67,
    title: "Blog Capstone Project Part 3 - RESTful Routing",
    track: "Advanced",
    lectures: 6,
    minutes: 6,
    project: {
      title: "Edit and delete",
      brief:
        "Add the destructive routes, with a confirm step before delete.",
    },
  },
  {
    day: 68,
    section: 68,
    title: "Authentication with Flask",
    track: "Advanced",
    lectures: 12,
    minutes: 45,
    project: {
      title: "Registration",
      brief:
        "Hashed passwords, session login, and a route only a logged-in user can reach.",
    },
  },
  {
    day: 69,
    section: 69,
    title: "Blog Capstone Project Part 4 - Adding Users",
    track: "Advanced",
    lectures: 7,
    minutes: 10,
    project: {
      title: "Comments",
      brief:
        "Comments attributed to the logged-in author, with the author able to delete their own.",
    },
  },
  {
    day: 70,
    section: 70,
    title: "Git, Github and Version Control",
    track: "Advanced",
    lectures: 10,
    minutes: 76,
    project: {
      title: "Practise the workflow",
      brief:
        "Branch, open a PR against your own repo, review your own diff, merge it.",
    },
  },
  {
    day: 71,
    section: 71,
    title: "Deploying Your Web Application",
    track: "Advanced",
    lectures: 8,
    minutes: 10,
    project: {
      title: "Deploy and document",
      brief:
        "Ship one Flask app and write the runbook so you can redo it in five minutes.",
    },
  },
  {
    day: 72,
    section: 72,
    title: "Data Exploration with Pandas: College Major v.s. Your Salary",
    track: "Advanced",
    lectures: 10,
    minutes: 8,
    project: {
      title: "Explore the internship feed",
      brief:
        "Load the listings JSON this platform uses. Which categories have the most Summer 2027 roles?",
    },
  },
  {
    day: 73,
    section: 73,
    title: "Data Visualisation with Matplotlib: Programming Languages",
    track: "Advanced",
    lectures: 11,
    minutes: 9,
    project: {
      title: "Chart your own hours",
      brief:
        "Plot your weekly study hours export. Add a rolling average line.",
    },
  },
  {
    day: 74,
    section: 74,
    title: "Aggregate & Merge Data with Pandas: Analyse the LEGO Dataset",
    track: "Advanced",
    lectures: 11,
    minutes: 14,
    project: {
      title: "Merge and group",
      brief:
        "Join the internship feed to a company list and group by category and term.",
    },
  },
  {
    day: 75,
    section: 75,
    title: "Google Trends Data: Resampling and Visualising Time Series",
    track: "Advanced",
    lectures: 9,
    minutes: 15,
    project: {
      title: "Resample your log",
      brief:
        "Take your daily study log to weekly and monthly. Where did the momentum go?",
    },
  },
  {
    day: 76,
    section: 76,
    title: "Beautiful Plotly Charts & Analysing the Android App Store",
    track: "Advanced",
    lectures: 9,
    minutes: 16,
    project: {
      title: "Interactive internships",
      brief:
        "A hoverable chart of postings over time, split by category.",
    },
  },
  {
    day: 77,
    section: 77,
    title: "Computation with NumPy and N-Dimensional Arrays",
    track: "Advanced",
    lectures: 6,
    minutes: 12,
    project: {
      title: "Matrix multiply by hand",
      brief:
        "Implement it with loops, then check against NumPy and time both.",
    },
  },
  {
    day: 78,
    section: 78,
    title: "Linear Regression and Data Visualisation with Seaborn",
    track: "Advanced",
    lectures: 9,
    minutes: 17,
    project: {
      title: "Hours vs problems",
      brief:
        "Regress your study hours against problems solved. Be honest about the R².",
    },
  },
  {
    day: 79,
    section: 79,
    title: "Analysing the Nobel Prize with Plotly, Matplotlib & Seaborn",
    track: "Advanced",
    lectures: 8,
    minutes: 22,
    project: {
      title: "Five questions",
      brief:
        "Pick any dataset. Ask five questions, answer each with one chart.",
    },
  },
  {
    day: 80,
    section: 80,
    title: "The Tragic Discovery of Handwashing: t-Tests & Distributions",
    track: "Advanced",
    lectures: 6,
    minutes: 16,
    project: {
      title: "Test your own habit",
      brief:
        "Do morning sessions beat evening ones? Run the t-test on your own log and interpret it properly.",
    },
  },
  {
    day: 81,
    section: 81,
    title: "Capstone Project - Predict House Prices",
    track: "Advanced",
    lectures: 2,
    minutes: 1,
    project: {
      title: "Predict your own data",
      brief:
        "Predict something from data you generated — next week's hours, or time-to-solve by difficulty.",
    },
  },
  {
    day: 82,
    section: 82,
    title: "Professional Portfolio Project - [Python Scripting]",
    track: "Portfolio",
    lectures: 2,
    minutes: 1,
    project: {
      title: "Internship CSV cleaner",
      brief:
        "A script that dedupes and normalises job postings from two sources.",
    },
  },
  {
    day: 83,
    section: 83,
    title: "Professional Portfolio Project - [Python Web Development]",
    track: "Portfolio",
    lectures: 2,
    minutes: 3,
    project: {
      title: "Interview log web app",
      brief:
        "Track companies, rounds and outcomes. Something you will actually use this cycle.",
    },
  },
  {
    day: 84,
    section: 84,
    title: "Professional Portfolio Project - [Python Scripting]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Repo health checker",
      brief:
        "Scan your GitHub repos for a missing README, licence or description.",
    },
  },
  {
    day: 85,
    section: 85,
    title: "Professional Portfolio Project - [GUI]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Desktop timer",
      brief:
        "A session timer that writes to the same log this platform reads.",
    },
  },
  {
    day: 86,
    section: 86,
    title: "Professional Portfolio Project - [GUI]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Flashcard desktop app",
      brief:
        "Your day 31 Leitner logic with a real interface.",
    },
  },
  {
    day: 87,
    section: 87,
    title: "Professional Portfolio Project - [Game]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Trading card game",
      brief:
        "Turn-based, with an AI opponent that plays greedily.",
    },
  },
  {
    day: 88,
    section: 88,
    title: "Professional Portfolio Project - [Web Development]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Public study log",
      brief:
        "A page that renders your exported progress JSON.",
    },
  },
  {
    day: 89,
    section: 89,
    title: "Professional Portfolio Project - [Web Development]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Order book viewer",
      brief:
        "Render a live crypto order book. Directly relevant to the quant track.",
    },
  },
  {
    day: 90,
    section: 90,
    title: "Professional Portfolio Project - [GUI Desktop App]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Markdown note app",
      brief:
        "Write, preview and save. Compare your parser to the one in this platform.",
    },
  },
  {
    day: 91,
    section: 91,
    title: "Professional Portfolio Project - [HTTP Requests & APIs]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Multi-board job poller",
      brief:
        "Poll several Greenhouse boards and diff against what you have seen.",
    },
  },
  {
    day: 92,
    section: 92,
    title: "Professional Portfolio Project - [Image Processing & Data Science]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Chart digitiser",
      brief:
        "Read a plot image and recover approximate data points.",
    },
  },
  {
    day: 93,
    section: 93,
    title: "Professional Portfolio Project - [Web Scraping]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Conference deadline scraper",
      brief:
        "Pull CFP and application deadlines into the programs section of this platform.",
    },
  },
  {
    day: 94,
    section: 94,
    title: "Professional Portfolio Project - [GUI Automation]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Application autofiller",
      brief:
        "Fill the repetitive fields of an application form from a profile file.",
    },
  },
  {
    day: 95,
    section: 95,
    title: "Professional Portfolio Project - [Game]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Market making game",
      brief:
        "Quote a two-sided market against a simulated flow. Practice for trader interviews.",
    },
  },
  {
    day: 96,
    section: 96,
    title: "Professional Portfolio Project - [HTTP Requests & APIs]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Backtest data fetcher",
      brief:
        "Pull and cache historical prices with sane rate limiting.",
    },
  },
  {
    day: 97,
    section: 97,
    title: "Professional Portfolio Project - [Web Development]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Problem of the day",
      brief:
        "A page that serves one unsolved problem from your own list each morning.",
    },
  },
  {
    day: 98,
    section: 98,
    title: "Professional Portfolio Project - [Python Automation]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Weekly review generator",
      brief:
        "Assemble a Monday summary from your logs and email it.",
    },
  },
  {
    day: 99,
    section: 99,
    title: "Professional Portfolio Project - [Data Science]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Prep analytics",
      brief:
        "Which patterns do you fail most? Chart it and let it pick next week's focus.",
    },
  },
  {
    day: 100,
    section: 100,
    title: "Professional Portfolio Project - [Data Science]",
    track: "Portfolio",
    lectures: 1,
    minutes: 0,
    project: {
      title: "Internship market report",
      brief:
        "Timing, volume and location of Summer 2027 postings. Write it up properly.",
    },
  },
  {
    day: 101,
    section: 101,
    title: "Final Stretch",
    track: "Wrap-up",
    lectures: 3,
    minutes: 161,
    project: null,
  },
  {
    day: 102,
    section: 102,
    title: "Bonus Lecture: Succeed in the Age of AI",
    track: "Wrap-up",
    lectures: 1,
    minutes: 2,
    project: null,
  },
];

export const COURSE_URL = "https://www.udemy.com/course/100-days-of-code/learn/";

/** Only the numbered days; sections 101 and 102 are the closing material. */
export const numberedDays = courseDays.filter((d) => d.day <= 100);

export const courseTotals = {
  days: numberedDays.length,
  lectures: courseDays.reduce((n, d) => n + d.lectures, 0),
  minutes: courseDays.reduce((n, d) => n + d.minutes, 0),
};
