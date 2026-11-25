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
    priority: "core",
    priorityNote:
      "Everything else sits on this. An hour spent here is an hour you do not lose later.",
    exercises: [
      {
        id: "1-1",
        title: "Swap without a temp",
        prompt:
          "Given two variables, swap their values in a single line with tuple unpacking, then print both to prove it worked.",
        runnable: true,
        starter: null,
      },
      {
        id: "1-2",
        title: "Receipt line",
        prompt:
          "Ask for an item, a unit price and a quantity, then print one receipt line with the total, aligned with an f-string.",
        runnable: true,
        starter: null,
      },
      {
        id: "1-3",
        title: "Miles to kilometres",
        prompt:
          "Read a distance in miles and print it in kilometres to two decimal places. Watch what happens if you forget float().",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "String work is half of every warm-up interview question, and f-strings are how you will print everything from here on.",
    exercises: [
      {
        id: "2-1",
        title: "Reverse and test",
        prompt:
          "Reverse a string with slicing and print whether it reads the same backwards. This is Valid Palindrome in three lines.",
        runnable: true,
        starter: null,
      },
      {
        id: "2-2",
        title: "Initials and slug",
        prompt:
          "Turn a full name into initials like A.A. and a URL slug like amos-abdulai, using only slicing, split and join.",
        runnable: true,
        starter: null,
      },
      {
        id: "2-3",
        title: "Type conversion drill",
        prompt:
          "Print the type of 5, 5.0, \"5\" and True. Then add 10 to the string version and explain in a comment what you had to do.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Branching is the grammar of every program. Leap years and grade boundaries are also classic phone-screen warm-ups.",
    exercises: [
      {
        id: "3-1",
        title: "Leap year, properly",
        prompt:
          "Decide whether a year is a leap year using the full rule: divisible by 4, not by 100, unless also by 400. Test 1900, 2000 and 2024.",
        runnable: true,
        starter: null,
      },
      {
        id: "3-2",
        title: "Grade boundaries",
        prompt:
          "Map a score from 0 to 100 to a letter grade with an elif chain, then print whether it is a pass. Check the boundaries exactly.",
        runnable: true,
        starter: null,
      },
      {
        id: "3-3",
        title: "Ticket pricing",
        prompt:
          "Price a cinema ticket from an age and whether it is a weekday, using nested conditions. Decide what happens at exactly 16 and 65.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Lists are the structure you will use most in interviews, so this day earns its place on that half alone. random looks like a toy here, but it is how Monte Carlo pricing works - you meet it again on Day 80 and in the market-making game in this app.",
    exercises: [
      {
        id: "4-1",
        title: "Coin-flip convergence",
        prompt:
          "Flip a coin 10, 1,000 and 100,000 times with random and print the fraction of heads each time. Watch it settle on 0.5. That is the whole idea behind Monte Carlo.",
        runnable: true,
        starter: null,
      },
      {
        id: "4-2",
        title: "Rotate a list",
        prompt:
          "Move the last element of a list to the front without any library, then print the list before and after.",
        runnable: true,
        starter: null,
      },
      {
        id: "4-3",
        title: "Random team split",
        prompt:
          "Shuffle a list of nine names and split them into three teams of three, printing each team on its own line.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Every traversal you write for the rest of your life is this day. Half the NeetCode array problems are one well-chosen loop.",
    exercises: [
      {
        id: "5-1",
        title: "FizzBuzz",
        prompt:
          "Print 1 to 100, replacing multiples of 3 with Fizz, of 5 with Buzz and of both with FizzBuzz. Still asked, still worth being quick at.",
        runnable: true,
        starter: null,
      },
      {
        id: "5-2",
        title: "Running maximum",
        prompt:
          "Walk a list of numbers once, tracking the largest seen so far, without using max(). This single-pass shape is most of Best Time to Buy and Sell Stock.",
        runnable: true,
        starter: null,
      },
      {
        id: "5-3",
        title: "Primes below 50",
        prompt:
          "Print every prime below 50 using nested loops. Then make it faster by stopping the inner loop early and say why that is allowed.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Decomposition. Writing a function that does exactly one thing is the habit a code reviewer notices first.",
    exercises: [
      {
        id: "6-1",
        title: "Refactor into a function",
        prompt:
          "Take the leap-year check from Day 3, make it a function that returns True or False, and call it on five years in a loop.",
        runnable: true,
        starter: null,
      },
      {
        id: "6-2",
        title: "Grid walker",
        prompt:
          "Write step_north and step_east, each taking an (x, y) tuple and returning a new one. Chain them to walk a path and print every position.",
        runnable: true,
        starter: null,
      },
      {
        id: "6-3",
        title: "One job each",
        prompt:
          "Take any script you have written so far and split it into three functions that each do one thing. Print the result to show it still works.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "A project day. The value is managing state across a loop, not the game itself.",
    exercises: [
      {
        id: "7-1",
        title: "Masked word",
        prompt:
          "Given a word and a set of guessed letters, print the word with the unguessed letters as underscores. That is Hangman's core in six lines.",
        runnable: true,
        starter: null,
      },
      {
        id: "7-2",
        title: "Guess loop",
        prompt:
          "Loop until a target letter is guessed, counting attempts and rejecting anything that is not a single letter.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Positional arguments, keyword arguments and defaults. You will read these signatures in every library you ever touch.",
    exercises: [
      {
        id: "8-1",
        title: "Default arguments",
        prompt:
          "Write greet(name, greeting=\"Hello\", punctuation=\"!\") and call it three ways: positionally, by keyword, and with one default overridden.",
        runnable: true,
        starter: null,
      },
      {
        id: "8-2",
        title: "Caesar both ways",
        prompt:
          "One function with a direction parameter that encodes or decodes, so you do not write the same logic twice.",
        runnable: true,
        starter: null,
      },
      {
        id: "8-3",
        title: "The mutable default trap",
        prompt:
          "Run the starter, work out why the second call prints two items, then fix it. This one catches professionals.",
        runnable: true,
        starter: "def add_item(item, basket=[]):\n    basket.append(item)\n    return basket\n\nprint(add_item(\"apple\"))\nprint(add_item(\"pear\"))\n",
      },
    ],
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
    priority: "core",
    priorityNote:
      "The most important day in the first half. A dictionary is a hash map, and a hash map answers more interview questions than any other structure - Two Sum, Contains Duplicate and Group Anagrams are all this day.",
    exercises: [
      {
        id: "9-1",
        title: "Count the letters",
        prompt:
          "Build a frequency dictionary from a string without collections.Counter, then print the most common letter.",
        runnable: true,
        starter: null,
      },
      {
        id: "9-2",
        title: "Two Sum, early",
        prompt:
          "Given a list and a target, find the two indices that add to it using a dictionary of complements in one pass. This is LeetCode problem 1 - you are doing it on Day 9.",
        runnable: true,
        starter: null,
      },
      {
        id: "9-3",
        title: "Nested lookup",
        prompt:
          "Given a dict of students to dicts of subject to score, print each student's best subject. Practises iterating a nested structure without getting lost.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "return versus print is the line between code you can test and code you can only watch.",
    exercises: [
      {
        id: "10-1",
        title: "Return, not print",
        prompt:
          "Rewrite the Day 3 grade function so it returns the grade instead of printing it, then print at the call site. Notice you can now assert on it.",
        runnable: true,
        starter: null,
      },
      {
        id: "10-2",
        title: "Early return",
        prompt:
          "Write a function that returns the first negative number in a list, or None if there is none. Return as soon as you find it.",
        runnable: true,
        starter: null,
      },
      {
        id: "10-3",
        title: "Functions as values",
        prompt:
          "Build a dict mapping \"+\", \"-\", \"*\" and \"/\" to four small functions, then look one up by symbol and call it. Functions are values; this is the idea Day 19 builds on.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "A capstone. Worth doing once for the loop-and-state practice, not worth polishing.",
    exercises: [
      {
        id: "11-1",
        title: "Hand scorer",
        prompt:
          "Score a blackjack hand where an ace counts 11 unless that busts, in which case it counts 1. Test it on a hand with two aces.",
        runnable: true,
        starter: null,
      },
      {
        id: "11-2",
        title: "Deal and compare",
        prompt:
          "Deal two random hands from a list of card values and print who wins, handling the tie.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "Scope bites everyone exactly once. Better here than at 2am during an internship.",
    exercises: [
      {
        id: "12-1",
        title: "Shadowed name",
        prompt:
          "Run the starter, explain in a comment why the printed value is what it is, then make the function actually change the outer value.",
        runnable: true,
        starter: "count = 0\n\ndef bump():\n    count = count + 1\n\nbump()\nprint(count)\n",
      },
      {
        id: "12-2",
        title: "Binary search by hand",
        prompt:
          "Guess a hidden number between 1 and 100 by halving the range each time, printing every guess. You have just written binary search - you meet it again as a NeetCode pattern.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Badly underrated. Reading a traceback quickly is a daily skill, and nobody ever teaches it twice.",
    exercises: [
      {
        id: "13-1",
        title: "Find the off-by-one",
        prompt:
          "The starter misses the last element. Find out why and fix it without changing the list.",
        runnable: true,
        starter: "nums = [3, 7, 2, 9, 4]\nlargest = nums[0]\nfor i in range(len(nums) - 1):\n    if nums[i] > largest:\n        largest = nums[i]\nprint(\"largest:\", largest)\n",
      },
      {
        id: "13-2",
        title: "Read the traceback",
        prompt:
          "Run the starter, then write a comment naming the exact line that failed, the exception type, and the smallest change that fixes it.",
        runnable: true,
        starter: "rows = [[1, 2], [3, 4], [5]]\ntotal = 0\nfor row in rows:\n    total += row[0] + row[1]\nprint(total)\n",
      },
      {
        id: "13-3",
        title: "Print your way out",
        prompt:
          "The starter returns the wrong average. Add prints to find out where, fix it, then delete the prints.",
        runnable: true,
        starter: "def average(nums):\n    total = 0\n    for n in nums:\n        total += n\n        average = total / len(nums)\n    return average\n\nprint(average([2, 4, 6]))\n",
      },
    ],
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
    priority: "skim",
    priorityNote:
      "Another guessing game. Every idea in it came from Days 9 to 12 - play it, do not study it.",
    exercises: [
      {
        id: "14-1",
        title: "Compare on one key",
        prompt:
          "Given two dicts that each have a follower count, print which is larger without writing the comparison twice.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "Getting off the browser and onto your own machine matters more than the coffee machine does. The machine itself is a long if/else.",
    exercises: [
      {
        id: "15-1",
        title: "Resource check",
        prompt:
          "Given a dict of what the machine has and a dict of what a drink needs, report every missing ingredient, not just the first.",
        runnable: true,
        starter: null,
      },
      {
        id: "15-2",
        title: "Run it locally",
        prompt:
          "Install Python on your own machine, put one of your earlier scripts in a file, and run it from the terminal. No browser involved.",
        runnable: false,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Classes are how every codebase you join is organised, and \"explain inheritance\" is still asked out loud in interviews.",
    exercises: [
      {
        id: "16-1",
        title: "A class from scratch",
        prompt:
          "Write a BankAccount with deposit, withdraw and a balance that refuses to go negative. Raise on an overdraft rather than printing.",
        runnable: true,
        starter: null,
      },
      {
        id: "16-2",
        title: "Dunder methods",
        prompt:
          "Add __repr__ and __eq__ to that class and show, by printing and comparing two accounts, what each one changed.",
        runnable: true,
        starter: null,
      },
      {
        id: "16-3",
        title: "Composition over inheritance",
        prompt:
          "Model a Car that has an Engine rather than one that inherits from Engine. Write a comment on why that is usually the better default.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "The same OOP ideas applied once more. Do it, then move on.",
    exercises: [
      {
        id: "17-1",
        title: "Question bank",
        prompt:
          "Write a Question class and a Quiz class that holds a list of them, asks each in turn and reports a score.",
        runnable: true,
        starter: null,
      },
      {
        id: "17-2",
        title: "Dict into a class",
        prompt:
          "Take the nested student dictionary from Day 9 and turn it into a Student class with a best_subject() method.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "Turtle graphics is a teaching toy. You will not meet it again after Day 23 - watch at speed.",
    exercises: [
      {
        id: "18-1",
        title: "Shapes without turtle",
        prompt:
          "Print a right-angled triangle and then a hollow square of asterisks with nested loops. Same geometry, no library.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Passing a function as an argument is the idea behind every callback, decorator, key= and map you will ever write.",
    exercises: [
      {
        id: "19-1",
        title: "Sort by a key",
        prompt:
          "Sort a list of dicts by one field with a lambda, then by two fields at once. This is how you sort anything real.",
        runnable: true,
        starter: null,
      },
      {
        id: "19-2",
        title: "Higher-order function",
        prompt:
          "Write apply_twice(f, x) that calls f on x twice, and pass it three different functions including a lambda.",
        runnable: true,
        starter: null,
      },
      {
        id: "19-3",
        title: "A tiny decorator",
        prompt:
          "Write a decorator that times the function it wraps and prints the elapsed milliseconds. Use it on a loop that sums a million numbers.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "Animation and coordinates. Enjoyable, not load-bearing.",
    exercises: [
      {
        id: "20-1",
        title: "Coordinate walk",
        prompt:
          "Represent a snake as a list of (x, y) tuples and print its positions after three moves, where each segment takes the place of the one in front.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "Inheritance is worth the time. List slicing is worth more than it looks - it is all over the array problems.",
    exercises: [
      {
        id: "21-1",
        title: "Slicing drills",
        prompt:
          "From a list of ten numbers, produce every second element, the last three, and a reversed copy, each in a single slice.",
        runnable: true,
        starter: null,
      },
      {
        id: "21-2",
        title: "Subclass it",
        prompt:
          "Subclass the Day 16 BankAccount into a SavingsAccount that adds interest, calling super().__init__ properly.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "A second arcade game with the same ideas as Snake.",
    exercises: [
      {
        id: "22-1",
        title: "Collision check",
        prompt:
          "Given two rectangles as (x, y, width, height), return whether they overlap. Get the edge cases right: touching is not overlapping.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "The last turtle day. Finish it and move on with a clear conscience.",
    exercises: [
      {
        id: "23-1",
        title: "Level progression",
        prompt:
          "Track a level number and a speed that rises each level, and print the first ten levels. Decide whether the rise should be linear or multiplicative.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Every job involves reading a file you did not write. This is also where your scripts stop being disposable.",
    exercises: [
      {
        id: "24-1",
        title: "Read, change, write",
        prompt:
          "Write a few lines to a file, read it back, upper-case every line, write that to a second file, then print both files' contents.",
        runnable: true,
        starter: null,
      },
      {
        id: "24-2",
        title: "Word frequency from a file",
        prompt:
          "Write a paragraph to a file, read it back and print the five most common words. Decide what counts as a word.",
        runnable: true,
        starter: null,
      },
      {
        id: "24-3",
        title: "pathlib drills",
        prompt:
          "Use pathlib to join a directory and a filename, read the suffix, check whether it exists, and create a directory. No string concatenation.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Pandas is the single most useful library on this whole list for AI and for quant. You will use it most weeks for the rest of your career.",
    exercises: [
      {
        id: "25-1",
        title: "DataFrame from scratch",
        prompt:
          "Build a DataFrame of five rows and three columns, then filter the rows, sort by a column and add a computed column. First import costs a download; later ones are free.",
        runnable: true,
        starter: "import pandas as pd\n\ndf = pd.DataFrame({\n    \"ticker\": [\"AAPL\", \"MSFT\", \"NVDA\", \"GOOG\", \"AMZN\"],\n    \"price\": [189.4, 412.1, 118.7, 174.2, 182.9],\n    \"shares\": [10, 4, 25, 8, 12],\n})\n\nprint(df)\n",
      },
      {
        id: "25-2",
        title: "Group and aggregate",
        prompt:
          "Add a sector column to that DataFrame, then use groupby to print the total value held per sector. groupby is pandas' answer to SQL's GROUP BY.",
        runnable: true,
        starter: null,
      },
      {
        id: "25-3",
        title: "CSV round trip",
        prompt:
          "Write the DataFrame to a CSV with to_csv, read it back with read_csv, and prove the result is identical.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Comprehensions are how Python is actually written. You will read them constantly, and a one-line comprehension in an interview reads as fluency.",
    exercises: [
      {
        id: "26-1",
        title: "Comprehension drills",
        prompt:
          "Rewrite three loops you have already written as comprehensions: a filter, a transform, and both at once. Keep the loop version in a comment to compare.",
        runnable: true,
        starter: null,
      },
      {
        id: "26-2",
        title: "Dict comprehension",
        prompt:
          "Build a dict mapping each word in a sentence to its length, then a second one keeping only the words longer than four letters.",
        runnable: true,
        starter: null,
      },
      {
        id: "26-3",
        title: "When not to",
        prompt:
          "Write a nested comprehension that flattens a list of lists, then write the same thing as a loop and say in a comment which you would ship.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "*args and **kwargs are core and you will meet them everywhere. Tkinter is not - take the argument handling and leave the widgets.",
    exercises: [
      {
        id: "27-1",
        title: "*args and **kwargs",
        prompt:
          "Write a function that accepts any number of positional and keyword arguments and prints both collections. Then call another function by unpacking them through.",
        runnable: true,
        starter: null,
      },
      {
        id: "27-2",
        title: "Config with defaults",
        prompt:
          "Write a function taking **kwargs that merges them over a dict of defaults, so a caller can override only what they care about.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "A desktop GUI with a timer. The pattern is a callback loop, which you already met on Day 19.",
    exercises: [
      {
        id: "28-1",
        title: "Countdown logic",
        prompt:
          "Write a function that turns a number of seconds into a mm:ss string, and print the countdown from 125 down to 120.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "A second Tkinter app. Build it if you want the portfolio piece, otherwise watch it through.",
    exercises: [
      {
        id: "29-1",
        title: "Password generator",
        prompt:
          "Generate a password of a given length with at least two digits and two symbols, shuffled so the classes are not grouped.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Exceptions and JSON. Every API you ever call returns JSON, and every one of them eventually fails.",
    exercises: [
      {
        id: "30-1",
        title: "try/except/else/finally",
        prompt:
          "Write code that uses all four blocks and print a line in each, so you can see exactly when each one runs.",
        runnable: true,
        starter: null,
      },
      {
        id: "30-2",
        title: "Raise your own",
        prompt:
          "Define a custom exception class and raise it from the Day 16 withdraw method, then catch it at the call site and print a friendly message.",
        runnable: true,
        starter: null,
      },
      {
        id: "30-3",
        title: "JSON round trip",
        prompt:
          "Turn a nested dict into a JSON string, write it to a file, read it back and compare. Then feed json.loads some broken text and handle the error.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "A capstone over Days 25 to 30. Good practice, nothing new.",
    exercises: [
      {
        id: "31-1",
        title: "Spaced repetition, by hand",
        prompt:
          "Given a list of cards each with a 'seen' count, write the rule that decides which card comes next. Compare your rule with the review queue on the Practice page.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "datetime is worth real attention - time handling is where quant code goes wrong. The email half you will do once and never again.",
    exercises: [
      {
        id: "32-1",
        title: "Date arithmetic",
        prompt:
          "Work out how many days until 1 August 2027, print the weekday of your birthday this year, and add 90 days to today.",
        runnable: true,
        starter: null,
      },
      {
        id: "32-2",
        title: "Parse and format",
        prompt:
          "Parse three date strings in different formats into datetime objects and print them all in ISO format. Note what happens with an ambiguous day/month.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "HTTP APIs are how programs talk to each other. This is the day your scripts stop being alone on your laptop.",
    exercises: [
      {
        id: "33-1",
        title: "Anatomy of a request",
        prompt:
          "Without the network, write a function that builds a full URL from a base, a path and a dict of query parameters, encoding them correctly.",
        runnable: true,
        starter: null,
      },
      {
        id: "33-2",
        title: "Call a real API",
        prompt:
          "On your own machine, call a public API with requests, check status_code before reading the body, and print two fields from the JSON.",
        runnable: false,
        starter: null,
      },
      {
        id: "33-3",
        title: "Handle the failures",
        prompt:
          "Write the error handling around that call: a non-200 status, a timeout, and a body that is not JSON. Three different problems, three different responses.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "More API practice wrapped in a GUI. The useful half is the parsing, not the window.",
    exercises: [
      {
        id: "34-1",
        title: "Parse a nested response",
        prompt:
          "Given a realistic nested JSON string from a quiz API, pull out the question text and the correct answer for every item.",
        runnable: true,
        starter: null,
      },
      {
        id: "34-2",
        title: "Decode HTML entities",
        prompt:
          "API text often arrives with &quot; and &#039; in it. Clean a string of them using the html module.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Secrets handling. Putting an API key in a public repository is the single most common way a student's first project embarrasses them.",
    exercises: [
      {
        id: "35-1",
        title: "Environment variables",
        prompt:
          "Read a key from an environment variable with a safe fallback, and print a masked version like sk-...4f2a rather than the key itself.",
        runnable: true,
        starter: null,
      },
      {
        id: "35-2",
        title: "Audit your own repos",
        prompt:
          "Go through your GitHub repositories and check nothing committed contains a key, a token or a password. Add a .env to .gitignore where it is missing.",
        runnable: false,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "The closest this course comes to your actual target. Market data in, a decision out - that is the shape of a trading system.",
    exercises: [
      {
        id: "36-1",
        title: "Percentage move",
        prompt:
          "Given yesterday's and today's close, print the percentage move to two decimal places and flag anything beyond five percent.",
        runnable: true,
        starter: null,
      },
      {
        id: "36-2",
        title: "Rolling window",
        prompt:
          "Given a list of thirty daily closes, print the five-day moving average at each point where one exists. This is the first indicator anyone writes.",
        runnable: true,
        starter: null,
      },
      {
        id: "36-3",
        title: "Alert rule",
        prompt:
          "Write a function that takes a price series and returns the dates where a rule you choose fires. Be explicit about lookahead - the rule must only see the past.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "POST requests and headers. Worth knowing because reading an API's docs and getting the headers right is a real skill.",
    exercises: [
      {
        id: "37-1",
        title: "GET versus POST",
        prompt:
          "Write a comment explaining what each one is for, when a body is appropriate, and why a GET should not change anything on the server.",
        runnable: true,
        starter: null,
      },
      {
        id: "37-2",
        title: "Build a request by hand",
        prompt:
          "Construct the dict of headers and the JSON body you would send to a bearer-token API. No network - just get the shape exactly right.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "Google Sheets as a database. Clever, but you will reach for a real one after Day 63.",
    exercises: [
      {
        id: "38-1",
        title: "Rows to records",
        prompt:
          "Turn a list of rows, where the first row is the header, into a list of dicts. This is what every sheet and CSV library does for you.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "The first half of a genuinely large project. The value is holding several APIs together without the code turning to mud.",
    exercises: [
      {
        id: "39-1",
        title: "Separate the layers",
        prompt:
          "Sketch, as three empty classes with docstrings, the split between fetching data, deciding something and notifying someone. Say why mixing them hurts later.",
        runnable: true,
        starter: null,
      },
      {
        id: "39-2",
        title: "Cheapest route",
        prompt:
          "Given a list of flight dicts with a price and a stop count, find the cheapest direct flight, falling back to the cheapest overall when there is none.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "The second half. Finishing a multi-day project is itself the skill being taught.",
    exercises: [
      {
        id: "40-1",
        title: "Deduplicate records",
        prompt:
          "Given a list of customer dicts with some duplicates by email, return one record per email, keeping the most recently added.",
        runnable: true,
        starter: null,
      },
      {
        id: "40-2",
        title: "Ship it",
        prompt:
          "Finish the project and push it to GitHub with a README that says what it does and how to run it. An unfinished project proves nothing.",
        runnable: false,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "Enough HTML to read a page and to scrape one. You do not need to be a web designer, but a backend engineer who cannot read HTML is handicapped.",
    exercises: [
      {
        id: "41-1",
        title: "Read the structure",
        prompt:
          "Given a block of HTML as a string, write a comment identifying every tag, which are nested in which, and what the attributes do.",
        runnable: true,
        starter: null,
      },
      {
        id: "41-2",
        title: "Build one page",
        prompt:
          "Write a single page with a heading, a list, a link and an image on your own machine, and open it in a browser.",
        runnable: false,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "Tables and forms. Skim it; come back when a scraping target needs it.",
    exercises: [
      {
        id: "42-1",
        title: "Table to data",
        prompt:
          "Given an HTML table as a string, work out by hand what list of dicts a scraper should produce from it. You automate this on Day 45.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "Enough CSS to make your own projects not look broken. That matters when a recruiter opens your portfolio.",
    exercises: [
      {
        id: "43-1",
        title: "Selector practice",
        prompt:
          "Given a block of HTML, write the CSS selectors that would target: every link inside a nav, the first list item, and anything with two classes.",
        runnable: true,
        starter: null,
      },
      {
        id: "43-2",
        title: "Style your page",
        prompt:
          "Give the Day 41 page a readable font, sensible spacing and a colour scheme. Dark mode if you like. Just make it not look like 1997.",
        runnable: false,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "The box model and positioning in depth. Learn it when a layout actually fights you.",
    exercises: [
      {
        id: "44-1",
        title: "Box model on paper",
        prompt:
          "Given a width, padding, border and margin, work out the total space an element occupies, with and without border-box. Write both answers in a comment.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Web scraping is how you get data nobody hands you - which is most interesting data in AI and in quant. It is also exactly how the internships feed in this app would be built.",
    exercises: [
      {
        id: "45-1",
        title: "Parse without the network",
        prompt:
          "Paste a block of HTML into a string, parse it with BeautifulSoup and pull out every link's text and href.",
        runnable: true,
        starter: null,
      },
      {
        id: "45-2",
        title: "Scrape a real page",
        prompt:
          "On your own machine, fetch a page you are allowed to scrape, check its robots.txt first, and pull out a table into a list of dicts.",
        runnable: false,
        starter: null,
      },
      {
        id: "45-3",
        title: "Be a good citizen",
        prompt:
          "Write a comment on rate limiting, identifying your scraper honestly, caching responses while developing, and why robots.txt matters even when ignoring it is possible.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "A fun Spotify project. The API work is the same as Day 33.",
    exercises: [
      {
        id: "46-1",
        title: "Dedupe a playlist",
        prompt:
          "Given a list of track dicts, remove duplicates by artist and title while keeping the original order.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "A price tracker is the first automation most people actually keep running. Good practice at the full loop: fetch, parse, compare, notify.",
    exercises: [
      {
        id: "47-1",
        title: "Parse a messy price",
        prompt:
          "Write a function that turns strings like \"$1,299.00\", \"£49.99\" and \"1 299,00 EUR\" into a float and a currency code. Real data looks like this.",
        runnable: true,
        starter: null,
      },
      {
        id: "47-2",
        title: "Change detection",
        prompt:
          "Given yesterday's and today's price dicts keyed by product, print only what changed, and by how much.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "Selenium drives a real browser. Worth knowing it exists and when it beats requests - and when it is massive overkill.",
    exercises: [
      {
        id: "48-1",
        title: "requests or Selenium",
        prompt:
          "Write a comment listing three signs a page needs a real browser and three signs it does not. Guess wrong and you waste hours.",
        runnable: true,
        starter: null,
      },
      {
        id: "48-2",
        title: "Drive a page",
        prompt:
          "On your own machine, use Selenium to open a page, fill a field and read a result back.",
        runnable: false,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "Automating a gym tracker. Same API ideas again.",
    exercises: [
      {
        id: "49-1",
        title: "Parse a workout sentence",
        prompt:
          "Turn \"ran 5km and swam for 30 minutes\" into a list of dicts with an activity, a quantity and a unit. Just string work, no AI needed.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "A dating-app bot. Watch it for the Selenium practice if you want, then move on.",
    exercises: [
      {
        id: "50-1",
        title: "Retry with backoff",
        prompt:
          "Write a loop that retries a flaky operation up to five times, waiting twice as long after each failure. That pattern is genuinely useful everywhere.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "An internet-speed complaint bot. More Selenium.",
    exercises: [
      {
        id: "51-1",
        title: "Threshold with hysteresis",
        prompt:
          "Write an alert that fires when speed drops below a limit, but does not fire again until it has recovered above a higher one. Stops alert spam.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "An Instagram bot. Be careful: this one is against most platforms' terms of service.",
    exercises: [
      {
        id: "52-1",
        title: "Rate limiter",
        prompt:
          "Write a function that allows at most N actions per minute, sleeping when it must. The idea matters far more than the bot does.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "The scraping capstone. Pulling the week together is the point.",
    exercises: [
      {
        id: "53-1",
        title: "End to end, offline",
        prompt:
          "Take an HTML string, parse out records, clean them, deduplicate them and write them to a CSV. Every stage of a scraper except the download.",
        runnable: true,
        starter: null,
      },
      {
        id: "53-2",
        title: "Handle the bad rows",
        prompt:
          "Add handling for a record with a missing field, a malformed number and an unexpected extra column. Decide: skip, default or fail loudly.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Flask is where you start building things other people can use. A backend framework is the clearest gap in a frontend-heavy portfolio.",
    exercises: [
      {
        id: "54-1",
        title: "Routing by hand",
        prompt:
          "Without Flask, write a dict mapping URL paths to functions, and a dispatch function that looks up a path and calls it. That is the core of every web framework.",
        runnable: true,
        starter: null,
      },
      {
        id: "54-2",
        title: "First Flask app",
        prompt:
          "On your own machine, run a Flask app with two routes and one that takes a URL parameter. Visit all three in a browser.",
        runnable: false,
        starter: null,
      },
      {
        id: "54-3",
        title: "Decorators, again",
        prompt:
          "Write a comment explaining how @app.route actually works, using what you learned about decorators on Day 19.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "URL parsing and dynamic routes. Short day, useful ideas.",
    exercises: [
      {
        id: "55-1",
        title: "Parse a URL",
        prompt:
          "Use urllib.parse to break a URL with a query string into its parts, then rebuild it with one parameter changed.",
        runnable: true,
        starter: null,
      },
      {
        id: "55-2",
        title: "Validate a path parameter",
        prompt:
          "Write a function that takes a path segment that should be a positive integer and returns either the number or a clear error.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "Templates and static files. Mechanical but necessary if you want the web projects to look like anything.",
    exercises: [
      {
        id: "56-1",
        title: "Template by hand",
        prompt:
          "Write a function that takes a template string with {name} placeholders and a dict, and fills it in without using str.format. You have just written Jinja.",
        runnable: true,
        starter: null,
      },
      {
        id: "56-2",
        title: "Escape the input",
        prompt:
          "Add escaping to that function so a value containing <script> renders as text. Explain in a comment what you just prevented.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "Jinja. Loops and conditionals inside templates - the same ideas, in a different syntax.",
    exercises: [
      {
        id: "57-1",
        title: "Logic in the template or not",
        prompt:
          "Write a comment on what belongs in a template and what belongs in the view function. Getting this wrong is why web codebases rot.",
        runnable: true,
        starter: null,
      },
      {
        id: "57-2",
        title: "Render a list",
        prompt:
          "On your own machine, pass a list of dicts into a Jinja template and render it as a table with a row per item.",
        runnable: false,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "Bootstrap. A component library you look up when you need it, not something to memorise.",
    exercises: [
      {
        id: "58-1",
        title: "Grid on paper",
        prompt:
          "Write a comment describing how a 12-column grid stacks on a phone and spreads on a desktop, and when you would reach for one.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "Styling the blog capstone. Pure CSS practice.",
    exercises: [
      {
        id: "59-1",
        title: "Readable by default",
        prompt:
          "List, in a comment, the five CSS decisions that most affect whether text is pleasant to read. Apply them to your Day 43 page.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "POST requests and forms. This is where your web apps stop being read-only, and where the security questions begin.",
    exercises: [
      {
        id: "60-1",
        title: "Validate before you trust",
        prompt:
          "Write a function that validates a form dict: required fields present, email shaped right, age a number in range. Return every error, not just the first.",
        runnable: true,
        starter: null,
      },
      {
        id: "60-2",
        title: "Why not GET",
        prompt:
          "Write a comment explaining why a form that changes something must not be a GET, with a concrete example of what goes wrong.",
        runnable: true,
        starter: null,
      },
      {
        id: "60-3",
        title: "Handle a submission",
        prompt:
          "On your own machine, add a Flask route that accepts a POST, validates it and re-renders the form with errors when it fails.",
        runnable: false,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "WTForms. A library that removes boilerplate you have now written by hand, which is the right order to learn it in.",
    exercises: [
      {
        id: "61-1",
        title: "CSRF, in your own words",
        prompt:
          "Write a comment explaining what a CSRF attack actually does and why a hidden token stops it. This gets asked in interviews.",
        runnable: true,
        starter: null,
      },
      {
        id: "61-2",
        title: "Field validation rules",
        prompt:
          "Write the validation rules you would want on a signup form, as a dict of field name to list of rules, before touching any library.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "A small project combining Flask, forms and a CSV. Practice, not new material.",
    exercises: [
      {
        id: "62-1",
        title: "CSV as a database, and why not",
        prompt:
          "Write a comment listing three things that break when a CSV is used as a database with more than one user. Day 63 is the answer.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "SQL and an ORM. SQL is asked in almost every software and quant interview, and it is the one skill on this list with the longest shelf life.",
    exercises: [
      {
        id: "63-1",
        title: "Write the SQL first",
        prompt:
          "Given three tables sketched in a comment, write by hand the SELECT with a JOIN, a WHERE and a GROUP BY that answers a question you choose. No ORM yet.",
        runnable: true,
        starter: null,
      },
      {
        id: "63-2",
        title: "SQLite in the page",
        prompt:
          "Use the sqlite3 module to create a table, insert five rows, and run a query with a GROUP BY. It is in the standard library, so this runs right here.",
        runnable: true,
        starter: "import sqlite3\n\ncon = sqlite3.connect(\":memory:\")\ncur = con.cursor()\ncur.execute(\"CREATE TABLE trade (ticker TEXT, qty INTEGER, price REAL)\")\ncur.executemany(\n    \"INSERT INTO trade VALUES (?, ?, ?)\",\n    [(\"AAPL\", 10, 189.4), (\"AAPL\", 5, 191.0), (\"MSFT\", 4, 412.1)],\n)\ncon.commit()\n\nfor row in cur.execute(\"SELECT ticker, SUM(qty) FROM trade GROUP BY ticker\"):\n    print(row)\n",
      },
      {
        id: "63-3",
        title: "ORM versus SQL",
        prompt:
          "Write a comment on what an ORM buys you and what it hides. Then name one query you would always write by hand.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "A database-backed site end to end. Good consolidation of Day 63.",
    exercises: [
      {
        id: "64-1",
        title: "Rank and reorder",
        prompt:
          "Given a list of film dicts with ratings, assign a rank to each, handling ties the way you think is right - and say why in a comment.",
        runnable: true,
        starter: null,
      },
      {
        id: "64-2",
        title: "Schema design",
        prompt:
          "Sketch, in a comment, the tables you would need for a site with films, users and reviews, including the keys that join them.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "Design theory. Pleasant and genuinely useful, but not what you are being hired for.",
    exercises: [
      {
        id: "65-1",
        title: "Steal a layout",
        prompt:
          "Find a site whose layout you admire, and write five sentences on exactly what it does with spacing, hierarchy and colour.",
        runnable: false,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Building your own REST API. Designing endpoints other people will call is a real engineering skill and a common system-design question.",
    exercises: [
      {
        id: "66-1",
        title: "Design the endpoints",
        prompt:
          "For a resource of your choosing, write out the full set of REST routes with methods, paths and status codes. Decide what a PUT returns versus a PATCH.",
        runnable: true,
        starter: null,
      },
      {
        id: "66-2",
        title: "Status codes that mean something",
        prompt:
          "Write a comment on when to use 200, 201, 204, 400, 401, 403, 404 and 422, with one concrete example each. Then look up one you were unsure about.",
        runnable: true,
        starter: null,
      },
      {
        id: "66-3",
        title: "Serve it",
        prompt:
          "On your own machine, build a Flask API with the routes you designed, returning JSON, and call every one of them.",
        runnable: false,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "The blog capstone turned into a proper API. Consolidation.",
    exercises: [
      {
        id: "67-1",
        title: "Paginate a list",
        prompt:
          "Write a function that takes a list, a page number and a page size, and returns that page plus the metadata a caller needs to request the next one.",
        runnable: true,
        starter: null,
      },
      {
        id: "67-2",
        title: "Version an API",
        prompt:
          "Write a comment on two ways to version an API and what breaks for existing callers if you do not.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Authentication. Password hashing, sessions and tokens - and the one area where getting it wrong is genuinely dangerous.",
    exercises: [
      {
        id: "68-1",
        title: "Why hashing, not encryption",
        prompt:
          "Write a comment explaining the difference, why a salt is needed, and why fast hashes like MD5 are wrong for passwords.",
        runnable: true,
        starter: null,
      },
      {
        id: "68-2",
        title: "Hash and verify",
        prompt:
          "Use hashlib with a per-user salt to hash a password and then verify it. Then write a comment on why a real app should use bcrypt or argon2 instead.",
        runnable: true,
        starter: null,
      },
      {
        id: "68-3",
        title: "Sessions versus tokens",
        prompt:
          "Write a comment comparing a server session cookie with a JWT: where state lives, what logout means in each, and which you would pick for a mobile client.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "Adding users to the capstone. The practical half of Day 68.",
    exercises: [
      {
        id: "69-1",
        title: "Authorisation, not authentication",
        prompt:
          "Write a function that decides whether a given user may edit a given post. Note in a comment how this differs from knowing who they are.",
        runnable: true,
        starter: null,
      },
      {
        id: "69-2",
        title: "The leaky error message",
        prompt:
          "Write a comment on why \"no such user\" and \"wrong password\" should be the same message, and what an attacker learns if they are not.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Git. Non-negotiable. You already use it for this project, so spend the time learning what is actually happening rather than memorising commands.",
    exercises: [
      {
        id: "70-1",
        title: "Explain the three areas",
        prompt:
          "Write a comment explaining the working tree, the staging area and the repository, and which command moves a change between each pair.",
        runnable: true,
        starter: null,
      },
      {
        id: "70-2",
        title: "Recover from a mistake",
        prompt:
          "On your own machine, deliberately commit something wrong, then fix it three ways: amend, revert and reset. Note when each is safe with a pushed branch.",
        runnable: false,
        starter: null,
      },
      {
        id: "70-3",
        title: "Branch and merge",
        prompt:
          "On your own machine, make two branches that change the same line, merge them, resolve the conflict by hand and read the result.",
        runnable: false,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Deployment. A project nobody can open is a private hobby - this is the day your work becomes evidence.",
    exercises: [
      {
        id: "71-1",
        title: "Twelve-factor config",
        prompt:
          "Write a comment on why configuration belongs in the environment and not in the code, and list what would break if you hardcoded a database URL.",
        runnable: true,
        starter: null,
      },
      {
        id: "71-2",
        title: "Deploy something",
        prompt:
          "Deploy one of your projects so it has a public URL. Then put that URL in your README and on your CV.",
        runnable: false,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Here the course turns into a data science course, and this is the half you came for. Pandas on real data, every day from here to Day 81.",
    exercises: [
      {
        id: "72-1",
        title: "Explore unseen data",
        prompt:
          "Build a DataFrame with a missing value and a wrong dtype, then use shape, head, info, describe, isna and value_counts to find both problems.",
        runnable: true,
        starter: null,
      },
      {
        id: "72-2",
        title: "Clean it",
        prompt:
          "Handle the missing value three ways - drop, fill with the mean, fill with a sentinel - and write a comment on when each is the honest choice.",
        runnable: true,
        starter: null,
      },
      {
        id: "72-3",
        title: "Answer a question",
        prompt:
          "Pose a question about your data, write the pandas that answers it, and write the answer in a comment as a sentence. That last step is the job.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Matplotlib. Every model you ever train and every strategy you ever test gets looked at as a chart before anyone believes it.",
    exercises: [
      {
        id: "73-1",
        title: "Plot without a screen",
        prompt:
          "Use the Agg backend to draw a line chart and save it to a PNG, then print the file size to prove it worked. No display needed.",
        runnable: true,
        starter: "# Agg is the backend that draws to a file instead of a window, which is\n# what you want here: this page has no window to draw into.\n#\n# savefig prints two MatplotlibDeprecationWarnings on this version. They come\n# from inside matplotlib, not from your code - a warning is not an error, and\n# the file is still written. Reading that difference is the skill.\nimport matplotlib\nmatplotlib.use(\"Agg\")\nimport matplotlib.pyplot as plt\nimport os\n\nplt.plot([1, 2, 3, 4], [10, 14, 11, 18], marker=\"o\")\nplt.title(\"First chart\")\nplt.savefig(\"chart.png\")\nprint(\"bytes:\", os.path.getsize(\"chart.png\"))\n",
      },
      {
        id: "73-2",
        title: "Two series, one axis",
        prompt:
          "Plot two series with different scales on one chart, then write a comment on why a second y-axis is usually the wrong fix and what to do instead.",
        runnable: true,
        starter: null,
      },
      {
        id: "73-3",
        title: "Label it properly",
        prompt:
          "Take any chart you have drawn and add a title, axis labels with units, and a legend. An unlabelled chart is not evidence of anything.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "groupby and merge. This is SQL thinking in pandas, and it is the single most used pair of operations in applied data work.",
    exercises: [
      {
        id: "74-1",
        title: "groupby drills",
        prompt:
          "On a DataFrame of trades, compute per ticker: the count, the mean price and the total quantity, in one groupby with agg.",
        runnable: true,
        starter: null,
      },
      {
        id: "74-2",
        title: "Every kind of join",
        prompt:
          "Merge two small DataFrames with inner, left, right and outer joins, and print the row counts. Write a comment on when each loses data.",
        runnable: true,
        starter: null,
      },
      {
        id: "74-3",
        title: "Pivot it",
        prompt:
          "Turn a long DataFrame into a wide one with pivot_table, then back again with melt. Long and wide is a distinction you will meet constantly.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Time series: resampling, rolling windows and date indexes. This is quant's native data shape - nothing else on the course is closer to the job.",
    exercises: [
      {
        id: "75-1",
        title: "Resample",
        prompt:
          "Build a daily series over 90 days, resample it to weekly and monthly means, and print all three lengths.",
        runnable: true,
        starter: null,
      },
      {
        id: "75-2",
        title: "Rolling and expanding",
        prompt:
          "Compute a 7-day rolling mean and an expanding mean on that series. Write a comment on what each one tells you that the other does not.",
        runnable: true,
        starter: null,
      },
      {
        id: "75-3",
        title: "Do not look ahead",
        prompt:
          "Shift a series forward by one day and write a comment explaining why using today's close to predict today's close is the most common way a backtest lies.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "Plotly. Interactive charts, nice for a portfolio. The analysis skill is the same as Day 73.",
    exercises: [
      {
        id: "76-1",
        title: "Choose the form",
        prompt:
          "For three questions you might ask of app-store data, write down which chart type answers each and why. Picking the form is most of the work.",
        runnable: true,
        starter: null,
      },
      {
        id: "76-2",
        title: "Honest axes",
        prompt:
          "Write a comment on what a truncated y-axis does to a reader's impression, and when starting an axis above zero is legitimate.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "NumPy is the foundation under pandas, scikit-learn, PyTorch and essentially all numerical Python. If you go anywhere near AI or quant, this is bedrock.",
    exercises: [
      {
        id: "77-1",
        title: "Vectorise a loop",
        prompt:
          "Sum the squares of a million numbers with a Python loop and then with NumPy, timing both. Print the speed-up and write it in a comment.",
        runnable: true,
        starter: "import numpy as np\nimport time\n\nn = 1_000_000\nstart = time.perf_counter()\ntotal = sum(i * i for i in range(n))\nloop_ms = (time.perf_counter() - start) * 1000\n\narr = np.arange(n)\nstart = time.perf_counter()\ntotal_np = int((arr * arr).sum())\nnp_ms = (time.perf_counter() - start) * 1000\n\nprint(f\"loop {loop_ms:.1f} ms, numpy {np_ms:.1f} ms, same answer: {total == total_np}\")\n",
      },
      {
        id: "77-2",
        title: "Broadcasting",
        prompt:
          "Add a 1-D array to a 2-D array and work out the rule from the result. Then deliberately cause a shape error and read what NumPy tells you.",
        runnable: true,
        starter: null,
      },
      {
        id: "77-3",
        title: "Boolean masks",
        prompt:
          "Use a boolean mask to select, count and replace elements of an array in place of an if inside a loop. This is how numerical code is written.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Your first actual model. Linear regression is the simplest thing that is genuinely a model, and it is still the baseline every serious project starts from.",
    exercises: [
      {
        id: "78-1",
        title: "Fit by hand",
        prompt:
          "With NumPy only, compute the slope and intercept of a best-fit line through ten points using the closed-form formulas, then predict a new value.",
        runnable: true,
        starter: null,
      },
      {
        id: "78-2",
        title: "What the residuals say",
        prompt:
          "Plot the residuals of that fit to a PNG and write a comment on what a pattern in them would mean about your model.",
        runnable: true,
        starter: null,
      },
      {
        id: "78-3",
        title: "Correlation is not causation",
        prompt:
          "Write a comment giving one concrete example from markets where two series correlate strongly and neither causes the other.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "A long analysis project across three plotting libraries. Good consolidation, little new.",
    exercises: [
      {
        id: "79-1",
        title: "One question, start to finish",
        prompt:
          "Pick a question, load or build the data, clean it, chart it, and write the answer as one sentence in a comment. The sentence is the deliverable.",
        runnable: true,
        starter: null,
      },
      {
        id: "79-2",
        title: "Pick the right chart",
        prompt:
          "For the same dataset, draw the same comparison two ways and write a comment on which reads faster and why.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "Statistics: distributions, t-tests and p-values. For quant research this is the subject, not a topic. Every AI interview eventually reaches it too.",
    exercises: [
      {
        id: "80-1",
        title: "Simulate a distribution",
        prompt:
          "Draw 10,000 samples from a normal distribution with NumPy, print the mean and standard deviation, and check what fraction falls within one and two sigma.",
        runnable: true,
        starter: null,
      },
      {
        id: "80-2",
        title: "Run a t-test",
        prompt:
          "Generate two samples from distributions with slightly different means and run a t-test with scipy. Then run it on two samples from the same distribution and compare the p-values.",
        runnable: true,
        starter: null,
      },
      {
        id: "80-3",
        title: "What a p-value is not",
        prompt:
          "Write a comment stating plainly what a p-value does and does not mean, and what p-hacking is. Getting this wrong in a quant interview is fatal.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "An end-to-end model on real data: the whole pipeline in one day, and the closest thing on this course to a machine-learning job.",
    exercises: [
      {
        id: "81-1",
        title: "Split before you look",
        prompt:
          "Split a dataset into train and test sets and write a comment on what exactly goes wrong if you scale or impute using the whole dataset first.",
        runnable: true,
        starter: null,
      },
      {
        id: "81-2",
        title: "Baseline first",
        prompt:
          "Predict the mean for every row and measure the error. Write it down - any model that cannot beat this is not a model.",
        runnable: true,
        starter: null,
      },
      {
        id: "81-3",
        title: "Fit and evaluate",
        prompt:
          "Fit a linear regression with scikit-learn, report the error on the held-out set, and compare it with your baseline in a comment.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "The portfolio stretch begins: briefs with no walkthrough. That is the point - this is the first time you build without being led.",
    exercises: [
      {
        id: "82-1",
        title: "Scope it before you code",
        prompt:
          "Write the brief as three bullet points: what it does, what it will not do, and how you will know it works. Then start.",
        runnable: true,
        starter: null,
      },
      {
        id: "82-2",
        title: "Ship a script",
        prompt:
          "Build the scripting project, put it on GitHub with a README, and record it on this page with the repo link.",
        runnable: false,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "A web project with no hand-holding. Flask plus everything from Days 54 to 71.",
    exercises: [
      {
        id: "83-1",
        title: "Design the routes first",
        prompt:
          "Write the route table - path, method, what it returns - before writing any code. Ten minutes here saves an evening.",
        runnable: true,
        starter: null,
      },
      {
        id: "83-2",
        title: "Ship it deployed",
        prompt:
          "Build it and deploy it so it has a public URL, not just a localhost screenshot.",
        runnable: false,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "A second scripting brief. Pick one that automates something you actually do.",
    exercises: [
      {
        id: "84-1",
        title: "Automate your own annoyance",
        prompt:
          "Name a task you do by hand at least weekly. Write the three steps a script would take. Then build it.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "A GUI brief. Build it only if a desktop app is something you want on your portfolio.",
    exercises: [
      {
        id: "85-1",
        title: "Separate logic from widgets",
        prompt:
          "Write the core logic of your GUI idea as plain functions with no interface at all, and run them here. The window is a thin layer on top.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "A second GUI brief. One desktop app is plenty for a portfolio.",
    exercises: [
      {
        id: "86-1",
        title: "Reuse, do not rebuild",
        prompt:
          "Take the logic from Day 85 and list what you would change to reuse it behind a web interface instead. If the answer is a lot, the split was wrong.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "A game brief. Fun, and genuinely good practice at state machines, but not what a quant desk asks about.",
    exercises: [
      {
        id: "87-1",
        title: "Game state as data",
        prompt:
          "Model your game's entire state as a single dict, and write one function that takes a state and a move and returns the next state. Pure functions make games testable.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "Another web brief. Every one of these you finish and deploy is a line on your CV that is actually true.",
    exercises: [
      {
        id: "88-1",
        title: "One new thing",
        prompt:
          "Choose one thing you have not done before - a database migration, a background job, a deployed cron - and build the project around it.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "A web brief, and the day this app's roadmap pointed at for a frontend built on a real engine.",
    exercises: [
      {
        id: "89-1",
        title: "Make the data real",
        prompt:
          "Whatever you build, feed it from a live source rather than a fixture. A project with real data in it reads completely differently.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "A desktop app brief. Skim unless desktop is where you want to be.",
    exercises: [
      {
        id: "90-1",
        title: "Package it",
        prompt:
          "Write a comment on what it takes for someone else to actually run your desktop app on their machine. That gap is why web won.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "An API brief. The closest portfolio day to backend work.",
    exercises: [
      {
        id: "91-1",
        title: "Cache the calls",
        prompt:
          "Write a function that caches API responses by URL with an expiry time, so development does not hammer someone else's server.",
        runnable: true,
        starter: null,
      },
      {
        id: "91-2",
        title: "Handle every failure",
        prompt:
          "List, in a comment, the six ways a call to someone else's API can fail, and what your code does for each one.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "Image processing plus data science. A good one if you are heading towards AI - images are where a lot of it lives.",
    exercises: [
      {
        id: "92-1",
        title: "An image is an array",
        prompt:
          "Build a small 2-D NumPy array, treat it as a greyscale image, and write a comment explaining what a convolution kernel would do to it.",
        runnable: true,
        starter: null,
      },
      {
        id: "92-2",
        title: "Pixels to statistics",
        prompt:
          "Compute the mean, standard deviation and histogram of that array. Every image model starts by normalising exactly these.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "A scraping brief. This is the one to pick if you want the internships feed in this app to become real.",
    exercises: [
      {
        id: "93-1",
        title: "Build the classifier's input",
        prompt:
          "Given five fake job descriptions as strings, write the keyword rules that would flag citizenship requirements and sponsorship language. Count the false positives.",
        runnable: true,
        starter: null,
      },
      {
        id: "93-2",
        title: "Scrape something you need",
        prompt:
          "Build a scraper that collects something you will actually use, store it as JSON, and run it twice to see what changed.",
        runnable: false,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "GUI automation. Clever, fragile, rarely the right answer at work.",
    exercises: [
      {
        id: "94-1",
        title: "When automation is the wrong tool",
        prompt:
          "Write a comment on three cases where clicking a UI with a script is the wrong answer and what to do instead - an API, a database, a bulk import.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "A game brief, and the second day this app's roadmap pointed at for the order book. You have already built that.",
    exercises: [
      {
        id: "95-1",
        title: "Compare with what you built",
        prompt:
          "Open the Order book page in this app and write a comment on what the matching engine does that a simpler version would get wrong.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "A second API brief. Build something you would use weekly.",
    exercises: [
      {
        id: "96-1",
        title: "Schedule it",
        prompt:
          "Write a comment on three ways to run a script on a schedule and the trade-offs of each: cron, a hosted scheduler, and a long-running process.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "useful",
    priorityNote:
      "The last web brief. Make this one the portfolio piece you actually link to.",
    exercises: [
      {
        id: "97-1",
        title: "Write the README first",
        prompt:
          "Write the README before the code: what it does, who it is for, how to run it, and a screenshot placeholder. Then build what you described.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "skim",
    priorityNote:
      "An automation brief. Pick it only if it saves you real time.",
    exercises: [
      {
        id: "98-1",
        title: "Measure the saving",
        prompt:
          "Estimate the minutes a week this would save, multiply by a year, and compare with the hours it will take to build. Sometimes the honest answer is do not.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "A data science brief with no walkthrough. For AI and quant this is the most valuable portfolio day on the course.",
    exercises: [
      {
        id: "99-1",
        title: "Choose a question worth asking",
        prompt:
          "Write the question, the data that would answer it, and what result would surprise you. If no result would surprise you, pick a better question.",
        runnable: true,
        starter: null,
      },
      {
        id: "99-2",
        title: "Full pipeline",
        prompt:
          "Load, clean, explore, model, evaluate and write up. Do all six in one notebook or script, and keep the dead ends in - they are part of the evidence.",
        runnable: true,
        starter: null,
      },
      {
        id: "99-3",
        title: "Write the conclusion",
        prompt:
          "Write the finding in five sentences a non-specialist could follow, including what your analysis cannot tell you. That last clause is what makes it credible.",
        runnable: true,
        starter: null,
      },
    ],
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
    priority: "core",
    priorityNote:
      "The last day, and a second data science brief. End the course with the piece you would put at the top of your CV.",
    exercises: [
      {
        id: "100-1",
        title: "Make it yours",
        prompt:
          "Pick a dataset nobody else on the course would pick - something from your own life, your university, or a market you follow. Generic projects read as generic.",
        runnable: true,
        starter: null,
      },
      {
        id: "100-2",
        title: "Baseline, model, honest error",
        prompt:
          "Report a baseline, a model and the error of each on held-out data. A project that reports only the good number is not evidence.",
        runnable: true,
        starter: null,
      },
      {
        id: "100-3",
        title: "Publish it",
        prompt:
          "Deploy or publish it so there is a link, not a screenshot. Then add it to this app's proof-of-work list.",
        runnable: false,
        starter: null,
      },
    ],
  },
  {
    day: 101,
    section: 101,
    title: "Final Stretch",
    track: "Wrap-up",
    lectures: 3,
    minutes: 161,
    project: null,
    priority: "skim",
    priorityNote:
      "Closing remarks and where to go next. Five minutes, and worth it for the 'what now' question alone.",
    exercises: [
      {
        id: "101-1",
        title: "Audit what stuck",
        prompt:
          "Go back through the core days and mark honestly which ones you could redo from memory today. Those are the ones to revisit.",
        runnable: false,
        starter: null,
      },
    ],
  },
  {
    day: 102,
    section: 102,
    title: "Bonus Lecture: Succeed in the Age of AI",
    track: "Wrap-up",
    lectures: 1,
    minutes: 2,
    project: null,
    priority: "skim",
    priorityNote:
      "A bonus talk on working alongside AI tools. Interesting and worth hearing once, but it is a talk, not practice.",
    exercises: [
      {
        id: "102-1",
        title: "Write down what is next",
        prompt:
          "Having finished, write the three things you would learn next and why. Put them in this app's Atlas if they are not there already.",
        runnable: false,
        starter: null,
      },
    ],
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
