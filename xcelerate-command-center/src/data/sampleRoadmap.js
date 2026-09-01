export const sampleRoadmap = {
  bootcampTitle: "XcelerateAI 6-Month JavaScript Mobile Ops Bootcamp",
  learner: "Dave",
  duration: "6 months",
  weeklyHours: "15-20 hours",
  months: [
    {
      monthNumber: 1,
      title: "JavaScript Foundations",
      objective: "Build core programming confidence from zero. Learn how JavaScript works and write your first real programs.",
      weeks: [
        {
          weekNumber: 1,
          title: "Setup and First Lines of Code",
          briefing: "Your mission this week is to prepare your development environment and write your very first JavaScript programs. Every expert started exactly where you are right now.",
          minimumMission: ["Install VS Code", "Install Node.js", "Write your first JavaScript file"],
          fullMission: ["Install VS Code and configure it", "Install Node.js and verify it works", "Watch the MDN JavaScript intro video", "Read the first steps docs", "Complete 3 practice exercises", "Push your first file to GitHub"],
          resources: [
            {
              title: "MDN JavaScript First Steps",
              url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps",
              type: "Docs",
              difficulty: "Beginner",
              whatToExpect: "A beginner-friendly introduction to JavaScript with clear explanations and interactive examples. No prior experience needed.",
              missionObjective: "Understand what JavaScript is, what it does, and how to write your first lines of code."
            },
            {
              title: "VS Code Download",
              url: "https://code.visualstudio.com/",
              type: "Tool",
              difficulty: "Beginner",
              whatToExpect: "The official VS Code website. Download the Windows installer and follow the setup wizard.",
              missionObjective: "Get your primary code editor installed and ready."
            },
            {
              title: "Node.js Download",
              url: "https://nodejs.org/",
              type: "Tool",
              difficulty: "Beginner",
              whatToExpect: "Download the LTS version of Node.js. This allows you to run JavaScript outside of a browser.",
              missionObjective: "Be able to run JavaScript files from the command line."
            }
          ],
          tasks: [
            "Download and install VS Code",
            "Install Node.js (LTS version)",
            "Create a GitHub account at github.com",
            "Create your first file: hello.js",
            "Write: console.log('Hello, XcelerateAI!')",
            "Run it in terminal: node hello.js"
          ],
          checkpoint: "Can I run a JavaScript file on my laptop and see output in the terminal?",
          deliverable: "A working hello.js file pushed to a new GitHub repository called 'xcelerate-js-foundations'."
        },
        {
          weekNumber: 2,
          title: "Variables, Data Types and Operators",
          briefing: "This week you learn how JavaScript stores and works with information. Variables are the building blocks of every program you will ever write.",
          minimumMission: ["Understand what a variable is", "Practice with strings and numbers"],
          fullMission: ["Learn var, let, and const differences", "Understand all data types", "Practice arithmetic operators", "Use comparison operators", "Build a mini calculator script"],
          resources: [
            {
              title: "JavaScript Variables - MDN",
              url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/Variables",
              type: "Docs",
              difficulty: "Beginner",
              whatToExpect: "A clear, step-by-step explanation of variables with real code examples you can run immediately.",
              missionObjective: "Be able to declare variables and store different types of data."
            },
            {
              title: "JavaScript.info — Data Types",
              url: "https://javascript.info/types",
              type: "Tutorial",
              difficulty: "Beginner",
              whatToExpect: "Interactive tutorial with exercises. You can run code right in your browser to test what you learn.",
              missionObjective: "Understand all 8 JavaScript data types and when to use each."
            }
          ],
          tasks: [
            "Learn the difference: var vs let vs const",
            "Create variables of different types: string, number, boolean",
            "Practice arithmetic: +, -, *, /, %",
            "Use comparison operators: ===, !==, >, <",
            "Build a calculator that adds two numbers",
            "Push your calculator to GitHub"
          ],
          checkpoint: "Can I declare a variable, assign it a value, and use it in a calculation?",
          deliverable: "A calculator.js script that performs basic math operations, pushed to GitHub."
        },
        {
          weekNumber: 3,
          title: "Functions and Control Flow",
          briefing: "Functions let you reuse code. Control flow lets your program make decisions. Together, these two concepts make you a real programmer.",
          minimumMission: ["Write your first function", "Use if/else statements"],
          fullMission: ["Write function declarations and expressions", "Use arrow functions", "Master if/else and switch", "Write for and while loops", "Build a number guessing game"],
          resources: [
            {
              title: "JavaScript Functions - MDN",
              url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
              type: "Docs",
              difficulty: "Beginner",
              whatToExpect: "The complete guide to writing functions in JavaScript. Lots of examples to try.",
              missionObjective: "Write reusable functions that take inputs and return outputs."
            },
            {
              title: "JavaScript.info — Functions",
              url: "https://javascript.info/function-basics",
              type: "Tutorial",
              difficulty: "Beginner",
              whatToExpect: "Interactive lesson on function basics with exercises.",
              missionObjective: "Understand how functions work and practice writing them."
            }
          ],
          tasks: [
            "Write 3 different functions using function declarations",
            "Rewrite them using arrow functions",
            "Write an if/else that checks a user's age",
            "Write a for loop that counts from 1 to 10",
            "Build a number guessing game in the terminal",
            "Push the guessing game to GitHub"
          ],
          checkpoint: "Can I write a function that takes a number as input and returns a result?",
          deliverable: "A number guessing game in the terminal, pushed to GitHub."
        },
        {
          weekNumber: 4,
          title: "Arrays, Objects and DOM Basics",
          briefing: "Arrays store lists of data. Objects store named data. The DOM lets JavaScript control web pages. This week you connect JavaScript to HTML for the first time.",
          minimumMission: ["Create and use an array", "Create a JavaScript object"],
          fullMission: ["Master arrays and array methods", "Create objects with properties and methods", "Select DOM elements with querySelector", "Listen to click events", "Build an interactive todo list"],
          resources: [
            {
              title: "JavaScript Arrays - MDN",
              url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/Arrays",
              type: "Docs",
              difficulty: "Beginner",
              whatToExpect: "A friendly introduction to arrays — how to create them, access items, and use built-in methods.",
              missionObjective: "Store and work with lists of data using arrays."
            },
            {
              title: "Introduction to the DOM - MDN",
              url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction",
              type: "Docs",
              difficulty: "Beginner",
              whatToExpect: "Explains what the DOM is and how JavaScript can interact with HTML elements.",
              missionObjective: "Select HTML elements and change them using JavaScript."
            }
          ],
          tasks: [
            "Create an array of 5 items and loop through it",
            "Use .map(), .filter(), and .forEach() on an array",
            "Create an object with 5 properties",
            "Select an HTML element with document.querySelector",
            "Add a click event listener to a button",
            "Build an interactive HTML todo list",
            "Push the todo list to GitHub"
          ],
          checkpoint: "Can I create an array, loop through it, and display the results on a web page?",
          deliverable: "An interactive HTML + JavaScript todo list, pushed to GitHub."
        }
      ]
    },
    {
      monthNumber: 2,
      title: "DOM Mastery and Async JavaScript",
      objective: "Build dynamic, interactive web pages. Understand how JavaScript communicates with servers and handles asynchronous operations.",
      weeks: [
        {
          weekNumber: 5,
          title: "Advanced DOM Manipulation",
          briefing: "Take your DOM skills to the next level. Learn how to dynamically create, modify, and remove elements, and handle complex user interactions.",
          minimumMission: ["Handle multiple click events", "Dynamically create HTML elements"],
          fullMission: ["Master event listeners and event delegation", "Create and remove DOM elements dynamically", "Handle form input and validation", "Use classList to toggle styles", "Build a dynamic content page"],
          resources: [
            {
              title: "DOM Manipulation Guide - MDN",
              url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model",
              type: "Docs",
              difficulty: "Intermediate",
              whatToExpect: "The complete DOM API reference with examples for every method.",
              missionObjective: "Create, update, and remove HTML elements with JavaScript."
            }
          ],
          tasks: [
            "Add event listeners to multiple different elements",
            "Create HTML elements with createElement and appendChild",
            "Remove elements dynamically on button click",
            "Handle form submission and validate input",
            "Build a project with dynamic content generation"
          ],
          checkpoint: "Can I build a web page where clicking buttons creates and removes HTML content?",
          deliverable: "A dynamic web page project pushed to GitHub."
        },
        {
          weekNumber: 6,
          title: "Fetch API and Promises",
          briefing: "JavaScript can communicate with servers to get live data. This week you learn promises, async/await, and the Fetch API — core skills for every modern developer.",
          minimumMission: ["Understand what a promise is", "Make your first fetch request"],
          fullMission: ["Understand callbacks and why they exist", "Learn promises and .then()/.catch()", "Master async/await syntax", "Use fetch() to get data from a public API", "Handle loading and error states", "Display API data on a page"],
          resources: [
            {
              title: "Fetch API - MDN",
              url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
              type: "Docs",
              difficulty: "Intermediate",
              whatToExpect: "Complete guide to making HTTP requests with the Fetch API.",
              missionObjective: "Fetch real data from a public API and display it on a web page."
            },
            {
              title: "JSONPlaceholder (Free Practice API)",
              url: "https://jsonplaceholder.typicode.com/",
              type: "Tool",
              difficulty: "Beginner",
              whatToExpect: "A free fake REST API for testing and prototyping. No signup needed.",
              missionObjective: "Practice making real API requests without needing a backend."
            }
          ],
          tasks: [
            "Understand what async JavaScript is and why it exists",
            "Write your first Promise",
            "Use async/await to simplify promise code",
            "Fetch data from JSONPlaceholder",
            "Display fetched posts on a web page",
            "Add loading spinner and error message"
          ],
          checkpoint: "Can I fetch data from a public API and display it on a web page?",
          deliverable: "A web app that fetches and displays real API data, pushed to GitHub."
        },
        {
          weekNumber: 7,
          title: "localStorage and State",
          briefing: "Apps need to remember things. localStorage lets you save data in the browser so it survives page refreshes. This week you build your first persistent app.",
          minimumMission: ["Save data to localStorage", "Read data from localStorage"],
          fullMission: ["Understand localStorage vs sessionStorage", "Save, retrieve, and delete data", "Convert objects to JSON strings", "Manage simple app state", "Build a persistent notes app"],
          resources: [
            {
              title: "Web Storage API - MDN",
              url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API",
              type: "Docs",
              difficulty: "Beginner",
              whatToExpect: "Clear guide to localStorage and sessionStorage with code examples.",
              missionObjective: "Build apps that remember data between sessions."
            }
          ],
          tasks: [
            "Save a string to localStorage",
            "Save an object using JSON.stringify()",
            "Read it back using JSON.parse()",
            "Delete specific items from storage",
            "Build a notes app that saves automatically",
            "Add delete functionality to your notes"
          ],
          checkpoint: "Can I build an app that remembers data after the page is refreshed?",
          deliverable: "A persistent notes app using localStorage, pushed to GitHub."
        },
        {
          weekNumber: 8,
          title: "ES6+ Modern JavaScript",
          briefing: "Modern JavaScript (ES6 and beyond) makes code cleaner, shorter, and more powerful. Every professional JavaScript developer uses these features daily.",
          minimumMission: ["Understand and use arrow functions", "Use destructuring to extract values"],
          fullMission: ["Arrow functions vs regular functions", "Destructuring arrays and objects", "Spread and rest operators", "Template literals", "Optional chaining", "Nullish coalescing", "ES6 modules (import/export)"],
          resources: [
            {
              title: "JavaScript.info — Modern JavaScript",
              url: "https://javascript.info/",
              type: "Tutorial",
              difficulty: "Intermediate",
              whatToExpect: "Comprehensive, interactive modern JavaScript tutorial. One of the best free resources available.",
              missionObjective: "Write clean, modern JavaScript using ES6+ features."
            }
          ],
          tasks: [
            "Rewrite 3 functions using arrow functions",
            "Use destructuring on an array and an object",
            "Practice spread operator to merge arrays",
            "Use template literals instead of string concatenation",
            "Use optional chaining on nested objects",
            "Refactor your previous projects to use ES6+ syntax"
          ],
          checkpoint: "Can I write modern JavaScript using arrow functions, destructuring, and template literals?",
          deliverable: "A refactored version of a previous project using ES6+ features, pushed to GitHub."
        }
      ]
    },
    {
      monthNumber: 3,
      title: "React Fundamentals",
      objective: "Build interactive user interfaces with React. Understand the component model, state management, and modern React patterns.",
      weeks: [
        {
          weekNumber: 9,
          title: "React Setup and Components",
          briefing: "React is the most popular way to build user interfaces in JavaScript. This week you set up your first React project and build your first components.",
          minimumMission: ["Create a React app with Vite", "Build your first component"],
          fullMission: ["Scaffold a React + Vite project", "Understand JSX syntax", "Build 5 functional components", "Pass and display props", "Understand the component tree"],
          resources: [
            {
              title: "React Official Documentation",
              url: "https://react.dev/",
              type: "Docs",
              difficulty: "Intermediate",
              whatToExpect: "The official React documentation with interactive examples. The Learn section is perfect for beginners.",
              missionObjective: "Understand the React component model and write your first components."
            },
            {
              title: "Create Vite App",
              url: "https://vitejs.dev/guide/",
              type: "Docs",
              difficulty: "Beginner",
              whatToExpect: "Guide to creating a new Vite project. Quick setup takes less than 2 minutes.",
              missionObjective: "Set up a React development environment with Vite."
            }
          ],
          tasks: [
            "Run: npm create vite@latest my-react-app -- --template react",
            "Run npm install and npm run dev",
            "Understand JSX — how HTML and JavaScript mix",
            "Build a Header component",
            "Build a Card component with props",
            "Build a Footer component",
            "Render all components in App.jsx"
          ],
          checkpoint: "Can I create a React component that accepts props and displays them?",
          deliverable: "A React app with 3+ components displaying content from props, pushed to GitHub."
        },
        {
          weekNumber: 10,
          title: "State, Hooks and Events",
          briefing: "State is what makes React apps dynamic. When state changes, the component re-renders automatically. This week you master useState and useEffect.",
          minimumMission: ["Use useState to manage data", "Handle a click event in React"],
          fullMission: ["Master useState hook", "Understand useEffect and when to use it", "Handle forms with controlled components", "Fetch API data in useEffect", "Build a dynamic React app"],
          resources: [
            {
              title: "React Hooks Reference",
              url: "https://react.dev/reference/react",
              type: "Docs",
              difficulty: "Intermediate",
              whatToExpect: "Complete reference for all React hooks with examples and common patterns.",
              missionObjective: "Manage dynamic data in React components using useState and useEffect."
            }
          ],
          tasks: [
            "Create a counter using useState",
            "Toggle elements visible/hidden with state",
            "Build a controlled form input",
            "Fetch data inside a useEffect",
            "Show loading and error states",
            "Build a React todo app with add/delete"
          ],
          checkpoint: "Can I build a React app that updates the UI when state changes?",
          deliverable: "A React todo app with full add, complete, and delete functionality."
        },
        {
          weekNumber: 11,
          title: "React Router and Navigation",
          briefing: "Most real apps have multiple pages. React Router lets you add navigation to React apps without full page reloads. Build your first multi-page React app.",
          minimumMission: ["Install React Router", "Create 2 routes"],
          fullMission: ["Install and configure React Router v6", "Create multiple page routes", "Use Link and NavLink components", "Pass URL parameters", "Create a 404 not found page"],
          resources: [
            {
              title: "React Router v6 Documentation",
              url: "https://reactrouter.com/en/main",
              type: "Docs",
              difficulty: "Intermediate",
              whatToExpect: "Official React Router docs with clear examples for every routing pattern.",
              missionObjective: "Build multi-page React applications with client-side navigation."
            }
          ],
          tasks: [
            "Install react-router-dom",
            "Wrap app in BrowserRouter",
            "Create Home, About, and Projects routes",
            "Use <Link> for navigation instead of <a>",
            "Create an active link style with NavLink",
            "Build a 404 catch-all route"
          ],
          checkpoint: "Can I build a React app with multiple pages and navigation that works without page reloads?",
          deliverable: "A multi-page React application with working navigation."
        },
        {
          weekNumber: 12,
          title: "Month 1 Capstone — React Portfolio",
          briefing: "You have learned enough React to build something real. This week you build and deploy your personal developer portfolio to the internet.",
          minimumMission: ["Build the homepage", "Deploy to Vercel"],
          fullMission: ["Design all pages", "Build Home, About, Projects pages", "Add real project cards", "Make it mobile responsive", "Deploy to Vercel", "Share the live link"],
          resources: [
            {
              title: "Vercel Deployment Guide",
              url: "https://vercel.com/docs/deployments/overview",
              type: "Docs",
              difficulty: "Beginner",
              whatToExpect: "Step-by-step guide to deploying a React app to Vercel. Free hosting, takes under 5 minutes.",
              missionObjective: "Get your React portfolio live on the internet with a shareable URL."
            }
          ],
          tasks: [
            "Plan your portfolio structure on paper",
            "Build the Home page with hero section",
            "Build the Projects page with 3 project cards",
            "Build an About page",
            "Make all pages responsive on mobile",
            "Push to GitHub",
            "Deploy to Vercel and get a live URL"
          ],
          checkpoint: "Do I have a live portfolio website that I built myself and can share with anyone?",
          deliverable: "A live React portfolio deployed to Vercel. URL added to GitHub profile."
        }
      ]
    },
    {
      monthNumber: 4,
      title: "React Native and Mobile Development",
      objective: "Build real cross-platform mobile applications with React Native and Expo. Run your code on your Samsung Galaxy A70.",
      weeks: [
        {
          weekNumber: 13,
          title: "React Native Setup and First Mobile App",
          briefing: "You already know React. React Native uses the same concepts but builds native mobile apps. This week you set up Expo and run your first app on your phone.",
          minimumMission: ["Install Expo CLI", "Run your first app on your phone"],
          fullMission: ["Install Expo CLI globally", "Create your first React Native project", "Install Expo Go on your Galaxy A70", "Run the app on your phone over WiFi", "Understand View, Text, and StyleSheet"],
          resources: [
            {
              title: "Expo Getting Started",
              url: "https://docs.expo.dev/get-started/introduction/",
              type: "Docs",
              difficulty: "Intermediate",
              whatToExpect: "Official Expo setup guide. Takes about 30 minutes from zero to app running on your phone.",
              missionObjective: "Have a React Native app running on your Samsung Galaxy A70."
            },
            {
              title: "Expo Go App",
              url: "https://play.google.com/store/apps/details?id=host.exp.exponent",
              type: "Tool",
              difficulty: "Beginner",
              whatToExpect: "Install this on your Galaxy A70 from the Play Store. It lets you run Expo apps on your real phone during development.",
              missionObjective: "Be able to test your React Native code on a real device."
            }
          ],
          tasks: [
            "Install Expo CLI: npm install -g expo-cli",
            "Create project: npx create-expo-app my-first-app",
            "Install Expo Go on your Galaxy A70",
            "Run: npx expo start and scan QR code",
            "Modify text and watch it update on your phone",
            "Understand the difference between View and div"
          ],
          checkpoint: "Can I run a React Native app on my Samsung Galaxy A70 and see changes in real time?",
          deliverable: "A customized React Native welcome screen running on your phone, code pushed to GitHub."
        },
        {
          weekNumber: 14,
          title: "Mobile UI Components and Styling",
          briefing: "Building a beautiful mobile UI requires understanding the React Native component system. This week you learn to design screens that look great on any phone.",
          minimumMission: ["Build a full-screen layout", "Use StyleSheet to style components"],
          fullMission: ["Master View, Text, Image, Button, TouchableOpacity", "Use ScrollView for scrollable content", "Use FlatList for lists of data", "Apply StyleSheet with flexbox", "Build a polished profile screen"],
          resources: [
            {
              title: "React Native Core Components",
              url: "https://reactnative.dev/docs/components-and-apis",
              type: "Docs",
              difficulty: "Intermediate",
              whatToExpect: "Complete reference for every React Native component with examples.",
              missionObjective: "Build polished, professional-looking mobile screens."
            }
          ],
          tasks: [
            "Build a home screen with header, body, and footer",
            "Use FlatList to render a list of items",
            "Add images with the Image component",
            "Create a pressable button with visual feedback",
            "Apply flexbox layout for responsive screens",
            "Build a profile screen with a photo, name, and bio"
          ],
          checkpoint: "Can I build a mobile screen that looks polished and professional?",
          deliverable: "A mobile app with 3 beautifully styled screens, pushed to GitHub."
        },
        {
          weekNumber: 15,
          title: "Navigation in React Native",
          briefing: "Mobile apps have multiple screens and users move between them by tapping. React Navigation is the standard library for adding navigation to React Native apps.",
          minimumMission: ["Install React Navigation", "Navigate between 2 screens"],
          fullMission: ["Install React Navigation dependencies", "Set up a Stack Navigator", "Set up a Bottom Tab Navigator", "Pass data between screens with params", "Add a header with back button"],
          resources: [
            {
              title: "React Navigation Documentation",
              url: "https://reactnavigation.org/docs/getting-started",
              type: "Docs",
              difficulty: "Intermediate",
              whatToExpect: "Official navigation library docs with step-by-step setup and examples for every navigator type.",
              missionObjective: "Build mobile apps where users can navigate between multiple screens."
            }
          ],
          tasks: [
            "Install @react-navigation/native and dependencies",
            "Create a Stack Navigator with 3 screens",
            "Add a Bottom Tab Navigator",
            "Pass a user ID from one screen to another",
            "Customize the header title and style",
            "Build a complete multi-screen app"
          ],
          checkpoint: "Can I build a mobile app with multiple screens and working navigation?",
          deliverable: "A multi-screen mobile app with stack and tab navigation."
        },
        {
          weekNumber: 16,
          title: "Data and Storage in Mobile",
          briefing: "Mobile apps need to remember data between sessions and often load from the internet. This week you master AsyncStorage and mobile API requests.",
          minimumMission: ["Save data with AsyncStorage", "Fetch API data on mobile"],
          fullMission: ["Install and use AsyncStorage", "Save user preferences persistently", "Fetch data from an API inside useEffect", "Handle loading and error states on mobile", "Build a data-driven mobile app"],
          resources: [
            {
              title: "AsyncStorage Documentation",
              url: "https://react-native-async-storage.github.io/async-storage/docs/usage",
              type: "Docs",
              difficulty: "Intermediate",
              whatToExpect: "Guide to installing and using AsyncStorage for persistent data in React Native.",
              missionObjective: "Build mobile apps that save user data and preferences between sessions."
            }
          ],
          tasks: [
            "Install @react-native-async-storage/async-storage",
            "Save user settings to AsyncStorage",
            "Read saved settings on app launch",
            "Fetch data from a public API on mobile",
            "Show a loading indicator during fetch",
            "Display a meaningful error if fetch fails"
          ],
          checkpoint: "Can I build a mobile app that fetches live data and remembers user preferences?",
          deliverable: "A data-driven mobile app with persistent storage, pushed to GitHub."
        }
      ]
    },
    {
      monthNumber: 5,
      title: "Advanced Features and Firebase",
      objective: "Add authentication, real-time database, and production-level features to your web and mobile apps.",
      weeks: [
        {
          weekNumber: 17,
          title: "Context API and Global State",
          briefing: "As apps grow, passing props between many components becomes painful. Context API lets you share data across your entire app without prop drilling.",
          minimumMission: ["Create a Context", "Use it in a child component"],
          fullMission: ["Design a context architecture", "Create Context and Provider", "Consume with useContext", "Combine with useReducer for complex state", "Refactor a project to use Context"],
          resources: [
            {
              title: "React Context API - Official Docs",
              url: "https://react.dev/learn/passing-data-deeply-with-context",
              type: "Docs",
              difficulty: "Advanced",
              whatToExpect: "Official React guide to Context with clear examples showing when and how to use it.",
              missionObjective: "Share data across components without prop drilling."
            }
          ],
          tasks: [
            "Create a UserContext with createContext",
            "Wrap App in a Provider component",
            "Access the context in a deeply nested component",
            "Add useReducer for actions (increment, decrement, reset)",
            "Refactor a previous app to use Context"
          ],
          checkpoint: "Can I share state across multiple components using Context without passing props?",
          deliverable: "An app using Context API for global state management."
        },
        {
          weekNumber: 18,
          title: "Firebase Authentication",
          briefing: "Most real apps require user accounts. Firebase Authentication makes adding email/password signup and login straightforward for any JavaScript developer.",
          minimumMission: ["Create a Firebase project", "Add email/password auth"],
          fullMission: ["Create Firebase project in the console", "Install Firebase SDK", "Set up email/password auth", "Build login and signup screens", "Protect routes for logged-in users only", "Handle auth errors gracefully"],
          resources: [
            {
              title: "Firebase Authentication Docs",
              url: "https://firebase.google.com/docs/auth/web/start",
              type: "Docs",
              difficulty: "Advanced",
              whatToExpect: "Complete Firebase auth setup guide. You will create a real Firebase project and add auth step by step.",
              missionObjective: "Add working user sign-up and login to your app using Firebase."
            }
          ],
          tasks: [
            "Create a Firebase project at console.firebase.google.com",
            "Enable Email/Password authentication",
            "Install firebase package: npm install firebase",
            "Write signup, login, and logout functions",
            "Build login and signup forms",
            "Redirect to dashboard after login"
          ],
          checkpoint: "Can I build an app where users can sign up with an email and password and stay logged in?",
          deliverable: "An app with working Firebase email/password authentication."
        },
        {
          weekNumber: 19,
          title: "Firestore Database",
          briefing: "Firestore is Firebase's real-time cloud database. Data updates across all connected devices instantly. This week you build your first cloud-connected app.",
          minimumMission: ["Connect to Firestore", "Read and write documents"],
          fullMission: ["Set up Firestore in your Firebase project", "Read documents from a collection", "Write (create) new documents", "Update and delete documents", "Use real-time listeners with onSnapshot", "Build a shared notes or todo app"],
          resources: [
            {
              title: "Firestore — Get Started",
              url: "https://firebase.google.com/docs/firestore/quickstart",
              type: "Docs",
              difficulty: "Advanced",
              whatToExpect: "Official Firestore guide covering full CRUD operations and real-time data.",
              missionObjective: "Build apps that store and read data from a real cloud database."
            }
          ],
          tasks: [
            "Enable Firestore in your Firebase project",
            "Read all documents from a collection",
            "Add a new document to Firestore",
            "Update a document with updateDoc",
            "Delete a document with deleteDoc",
            "Use onSnapshot for real-time updates"
          ],
          checkpoint: "Can I build an app that reads and writes data to Firestore in real time?",
          deliverable: "A real-time app using Firestore for data storage."
        },
        {
          weekNumber: 20,
          title: "Push Notifications and Device Features",
          briefing: "Native mobile apps can send push notifications and access device hardware like the camera. This week you add these features to your React Native app.",
          minimumMission: ["Set up push notifications", "Access the device camera"],
          fullMission: ["Set up Expo Notifications", "Request permission from the user", "Schedule a local notification", "Use expo-image-picker for camera access", "Add notifications to your app"],
          resources: [
            {
              title: "Expo Push Notifications",
              url: "https://docs.expo.dev/push-notifications/overview/",
              type: "Docs",
              difficulty: "Advanced",
              whatToExpect: "Complete guide to local and push notifications with Expo. No separate push server needed for local notifications.",
              missionObjective: "Send notifications to the user from your React Native app."
            }
          ],
          tasks: [
            "Install expo-notifications",
            "Request notification permissions from the user",
            "Schedule a local notification after a delay",
            "Install expo-image-picker",
            "Let users pick a photo from their gallery",
            "Display the selected photo in the app"
          ],
          checkpoint: "Can I send a push notification and let users pick photos from their camera roll?",
          deliverable: "A mobile app with push notifications and camera/gallery access."
        }
      ]
    },
    {
      monthNumber: 6,
      title: "Capstone Projects and Launch",
      objective: "Build, polish, and deploy production-ready projects. Launch your web app and mobile app to the world and update your portfolio.",
      weeks: [
        {
          weekNumber: 21,
          title: "Capstone Planning and Design",
          briefing: "The most important coding skill is knowing what to build before you build it. This week you plan your final capstone project in full detail before writing a single line of code.",
          minimumMission: ["Define your app's purpose", "Create a simple wireframe"],
          fullMission: ["Define all features", "Create wireframes on paper or Figma", "Plan the database structure", "Set up GitHub repository", "Plan the component tree", "Write a project brief"],
          resources: [
            {
              title: "Figma (Free Design Tool)",
              url: "https://www.figma.com/",
              type: "Tool",
              difficulty: "Beginner",
              whatToExpect: "Free design tool for wireframes and mockups. The free plan is more than enough for your project planning.",
              missionObjective: "Create wireframes and a clear plan before coding."
            }
          ],
          tasks: [
            "Decide on your capstone app idea",
            "List all features in a simple document",
            "Draw wireframes for each screen/page",
            "Plan the Firestore data structure",
            "Create the GitHub repository",
            "Write a README with your project goals"
          ],
          checkpoint: "Do I have a clear, written plan for my capstone project with wireframes?",
          deliverable: "Project plan document, wireframes, and GitHub repo. Shared with Lemont for feedback."
        },
        {
          weekNumber: 22,
          title: "Capstone Build — Week 1",
          briefing: "Build week. Follow your plan and implement the core features of your capstone project. Focus on functionality first, polish later.",
          minimumMission: ["Build the main pages", "Connect to Firebase"],
          fullMission: ["Implement all core features", "Connect Firebase auth", "Set up Firestore for data", "Build all planned components", "Test on mobile"],
          resources: [
            {
              title: "React + Firebase Full Tutorial",
              url: "https://www.youtube.com/results?search_query=react+firebase+tutorial+2024",
              type: "Video",
              difficulty: "Advanced",
              whatToExpect: "Search for full-stack React + Firebase tutorials to reinforce what you have learned.",
              missionObjective: "Complete the core features of your capstone project."
            }
          ],
          tasks: [
            "Build all main pages/screens",
            "Connect Firebase authentication",
            "Implement Firestore CRUD operations",
            "Test every feature manually",
            "Fix all critical bugs",
            "Push working code to GitHub"
          ],
          checkpoint: "Is my capstone app functional with auth and database working?",
          deliverable: "A working (not yet polished) capstone app with core features complete."
        },
        {
          weekNumber: 23,
          title: "Capstone Polish and Mobile Testing",
          briefing: "Now that features work, make them feel great. Polish the UI, fix edge cases, test on your real device, and optimize performance.",
          minimumMission: ["Polish the UI", "Test fully on your Galaxy A70"],
          fullMission: ["Fix all UI inconsistencies", "Test every user flow end to end", "Handle all error states", "Optimize slow parts", "Make it mobile responsive", "Write a proper README"],
          resources: [
            {
              title: "Web Accessibility Basics",
              url: "https://web.dev/accessibility/",
              type: "Docs",
              difficulty: "Intermediate",
              whatToExpect: "Introduction to making web apps accessible. Even basic improvements make a big difference.",
              missionObjective: "Build a polished, accessible, production-ready application."
            }
          ],
          tasks: [
            "Review every screen for visual consistency",
            "Test every button, form, and interaction",
            "Test on your Samsung Galaxy A70",
            "Fix all remaining bugs",
            "Add proper loading states everywhere",
            "Write a complete README.md",
            "Record a demo video"
          ],
          checkpoint: "Is my app polished, bug-free, and ready to show to the world?",
          deliverable: "A polished, fully tested capstone app with a video demo."
        },
        {
          weekNumber: 24,
          title: "Deployment and Launch Day",
          briefing: "This is the final mission. Deploy both your web app and mobile app, update your portfolio with everything you have built, and announce your completion.",
          minimumMission: ["Deploy web app to Vercel", "Update your portfolio"],
          fullMission: ["Deploy web app to Vercel", "Build mobile app with EAS Build", "Submit to Google Play or Expo Store", "Update portfolio with all 6 months of projects", "Write a LinkedIn post about your journey", "Celebrate this achievement"],
          resources: [
            {
              title: "EAS Build — Expo App Stores",
              url: "https://docs.expo.dev/build/introduction/",
              type: "Docs",
              difficulty: "Advanced",
              whatToExpect: "Complete guide to building and publishing Expo apps to app stores using EAS Build.",
              missionObjective: "Get your mobile app published and your web app live."
            }
          ],
          tasks: [
            "Deploy web app to Vercel",
            "Verify the live URL works on multiple devices",
            "Build the mobile app with EAS Build",
            "Submit to Google Play Console (or Expo Store)",
            "Update your portfolio with all projects from the bootcamp",
            "Write a LinkedIn post: 'I just completed the XcelerateAI Bootcamp'",
            "Share your portfolio URL with Lemont"
          ],
          checkpoint: "Are my apps live, my portfolio updated, and my journey documented?",
          deliverable: "Live web app URL + mobile app published + updated portfolio. Mission accomplished."
        }
      ]
    }
  ],
  projects: [
    {
      name: "JS Foundations Collection",
      description: "A collection of JavaScript programs demonstrating core language fundamentals — your first steps as a developer.",
      milestones: [
        "hello.js — First program running in terminal",
        "calculator.js — Basic math operations",
        "guessing-game.js — Number guessing game with loops",
        "todo-list.html — Interactive DOM todo list"
      ]
    },
    {
      name: "JavaScript Async Mini-Apps",
      description: "Projects that demonstrate DOM mastery, async programming, and localStorage persistence.",
      milestones: [
        "Dynamic DOM project with event delegation",
        "API data fetcher with loading states",
        "Persistent notes app with localStorage",
        "ES6+ refactored project"
      ]
    },
    {
      name: "React Portfolio Website",
      description: "A personal developer portfolio built with React, multi-page routing, and deployed live to Vercel.",
      milestones: [
        "Plan and wireframe all pages",
        "Build Home page with hero section",
        "Build Projects page with real project cards",
        "Build About page",
        "Make fully mobile responsive",
        "Deploy to Vercel — get live URL"
      ]
    },
    {
      name: "React Native Mobile App",
      description: "A multi-screen mobile application built with React Native and Expo, tested on Samsung Galaxy A70.",
      milestones: [
        "Set up Expo and run on Galaxy A70",
        "Build 3 polished screens",
        "Add Stack + Tab navigation",
        "Add AsyncStorage persistence",
        "Add push notifications"
      ]
    },
    {
      name: "Capstone Full-Stack App",
      description: "A complete production-ready application with React or React Native, Firebase authentication, and Firestore database.",
      milestones: [
        "Define app idea and write project brief",
        "Create wireframes and plan data structure",
        "Implement all core features",
        "Connect Firebase auth and Firestore",
        "Polish UI and fix all bugs",
        "Deploy to Vercel (web) or app store (mobile)",
        "Update portfolio and announce completion"
      ]
    }
  ],
  checkpoints: [
    {
      skill: "Terminal Basics",
      question: "Can I open the terminal, navigate folders, and run a JavaScript file with Node?",
      statusOptions: ["Not yet", "Learning", "Confident"]
    },
    {
      skill: "JavaScript Variables",
      question: "Can I explain the difference between var, let, and const — and when to use each?",
      statusOptions: ["Not yet", "Learning", "Confident"]
    },
    {
      skill: "Functions",
      question: "Can I write a function that takes input, processes it, and returns a result?",
      statusOptions: ["Not yet", "Learning", "Confident"]
    },
    {
      skill: "DOM Manipulation",
      question: "Can I select an HTML element and change its content or style with JavaScript?",
      statusOptions: ["Not yet", "Learning", "Confident"]
    },
    {
      skill: "Async JavaScript",
      question: "Can I explain what a promise is and use async/await to fetch data from an API?",
      statusOptions: ["Not yet", "Learning", "Confident"]
    },
    {
      skill: "localStorage",
      question: "Can I save, read, and delete data from localStorage without looking up the syntax?",
      statusOptions: ["Not yet", "Learning", "Confident"]
    },
    {
      skill: "React Components",
      question: "Can I build a React component that accepts props and renders them to the screen?",
      statusOptions: ["Not yet", "Learning", "Confident"]
    },
    {
      skill: "React State",
      question: "Can I use useState to make a component update when the user interacts with it?",
      statusOptions: ["Not yet", "Learning", "Confident"]
    },
    {
      skill: "React Router",
      question: "Can I add multiple pages to a React app and navigate between them without a reload?",
      statusOptions: ["Not yet", "Learning", "Confident"]
    },
    {
      skill: "React Native",
      question: "Can I run a React Native app on my Samsung Galaxy A70 using Expo Go?",
      statusOptions: ["Not yet", "Learning", "Confident"]
    },
    {
      skill: "Firebase Auth",
      question: "Can I add email/password sign-up and login to an app using Firebase?",
      statusOptions: ["Not yet", "Learning", "Confident"]
    },
    {
      skill: "Firestore",
      question: "Can I read and write data to a Firestore collection from my app?",
      statusOptions: ["Not yet", "Learning", "Confident"]
    },
    {
      skill: "Git and GitHub",
      question: "Can I create a repo, make commits, and push my code to GitHub from the terminal?",
      statusOptions: ["Not yet", "Learning", "Confident"]
    },
    {
      skill: "Deployment",
      question: "Can I deploy a React app to Vercel and share a working URL?",
      statusOptions: ["Not yet", "Learning", "Confident"]
    },
    {
      skill: "Problem Solving",
      question: "When I get stuck, can I debug methodically using console.log and browser DevTools?",
      statusOptions: ["Not yet", "Learning", "Confident"]
    }
  ]
};
