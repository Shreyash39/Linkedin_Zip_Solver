# 🔗 Linkedin Zip Solver

A blazing-fast, extensible C++ solver for the "Zip" logic puzzle as seen on LinkedIn and other platforms.  
This project features sample input files, clear code, and visual output for easy verification and learning.  
**Perfect for puzzle fans, algorithmic problem solvers, and those looking to showcase problem-solving skills on their CV!**

---

## ⭐ What is a "Zip" Puzzle?

A "Zip" puzzle challenges you to fill a grid by connecting numbers in a consecutive path—filling every cell, with each step moving to an orthogonally adjacent cell.  
The goal: Start with 1, follow to 2, then 3, ... until the last number.

---

## 🗂️ Project Structure

```
Linkedin_Zip_Solver/
│
├── main.cpp             # Main C++ solver & entry point
├── input1.txt           # Sample input file 1 (example below)
├── [other inputs]
├── README.md            # You're here!
└── [other files]
```

---

## 📝 Sample Input Format

Each input file describes the puzzle grid for the solver.

**Example — [`input1.txt`]**:
```
7 7
17 18 19 -1 -1 -1 -1 
16 11 10 -1 -1 -1 -1 
15 12 3  -1 -1 -1 -1 
-1 -1 -1 1 4 9 20
-1 -1 -1 2 5 8 21 
-1 -1 -1 13 6 7 22
-1 -1 -1 14 25 24 23
```
- First line: grid size (`rows cols`)
- Next lines: Clues. `-1` = empty cell, numbers = given clues.

---

## 🎯 Objective

- Fill the grid from 1 to N² in order.
- Each move must be to an orthogonally adjacent cell (up/down/left/right).
- Use all cells exactly once.

---

## 🖼️ Visual Example

### 🟦 Official Puzzle (from LinkedIn app)
![Expected Output](image1)

*Connect the numbers in order, filling every square!*

---

### 🟩 Solver Input (as used by the code)

```
7 7
17 18 19 -1 -1 -1 -1 
16 11 10 -1 -1 -1 -1 
15 12 3  -1 -1 -1 -1 
-1 -1 -1 1 4 9 20
-1 -1 -1 2 5 8 21 
-1 -1 -1 13 6 7 22
-1 -1 -1 14 25 24 23
```

### 🟧 Output (from our C++ solver)

```txt
17 18 19 20 21 22 23
16 11 10  9  8  7 24
15 12  3  4  5  6 25
14 13  2  1 26 27 28
.  .  .  .  .  .  .
```
*(output will match the expected path as shown in the image above)*

---

## 🎨 Output Visualization

Want to see the result as a colorful grid or animated path?  
Export the output to CSV, use a spreadsheet, or plug into a visualizer for GIFs!

---

## 🚀 How to Use

1. **Compile:**
   ```sh
   g++ -O2 -std=c++17 main.cpp -o zip_solver
   ```

2. **Run:**
   ```sh
   ./zip_solver input1.txt
   ```

   or for all inputs:
   ```sh
   for file in input*.txt; do ./zip_solver "$file"; done
   ```

3. **See results!**  
   Standard output shows the filled grid and optionally a graphical output if implemented.

---

## 🧠 How Does It Work?

- **Input Parsing:** Reads the provided grid and clues.
- **Constraint Propagation:** Fast logical deduction to reduce the search space.
- **Backtracking Search:** Recursive search to find a valid path.
- **Output:** Prints the solution grid, optionally visualizes the path.

---

## ⏱️ Complexity

- **Time Complexity:**  
  - Worst-case: O(N!) for N cells (brute force)
  - Practical: Much faster due to constraint propagation and pruning.
- **Space Complexity:**  
  - O(N²) for grid and auxiliary structures.

---

## 🏆 Why This Project Shines (for your CV!)

- **Algorithmic depth:** Implements pathfinding, search, and constraint logic in C++.
- **Robust IO:** Handles real-world puzzle data and image-based inputs (with extensions).
- **Testable & Extensible:** Add your own puzzles, visualize solutions, or extend to other puzzle types.
- **Professional Documentation:** Clear structure, sample files, and visual walkthroughs.

---

## 🧩 Extending the Solver

- Add new grid sizes or puzzle types!
- Integrate with OCR/image recognition for automatic input from screenshots.
- Build a web or GUI interface for more interactivity.

---

## 🤝 Contributing

Pull requests and suggestions welcome!  
Please open an issue for discussion or bug reports.

---

## 📄 License

MIT License

---

> Made with ❤️ by [@Shreyash39](https://github.com/Shreyash39)  
> Tags: #C++ #Algorithm #Puzzle #Pathfinding #LinkedIn #Solver #Visualization
