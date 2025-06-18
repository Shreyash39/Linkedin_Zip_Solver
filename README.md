# 🔗 Linkedin Zip Solver

A fast and extensible C++ solver for "Zip" logic puzzles, as seen on LinkedIn and similar platforms.  
This project features sample input files, clean code, and visual output for easy verification.  

---

## What is a "Zip" Puzzle?

A "Zip" puzzle requires filling a grid by connecting numbers in a consecutive path—filling every cell, moving only to an orthogonally adjacent cell at each step.

---

## Sample Input Format

Each input file describes the puzzle grid:

```
7 7
17 18 19 -1 -1 -1 -1 
16 11 10 -1 -1 -1 -1 
15 12  3 -1 -1 -1 -1 
-1 -1 -1  1  4  9 20
-1 -1 -1  2  5  8 21 
-1 -1 -1 13  6  7 22
-1 -1 -1 14 25 24 23
```
- First line: grid size (`rows cols`)
- Next lines: Clues (`-1` means empty cell, numbers are clues).

---

## Example

### Puzzle Input

```
7 7
17 18 19 -1 -1 -1 -1 
16 11 10 -1 -1 -1 -1 
15 12  3 -1 -1 -1 -1 
-1 -1 -1  1  4  9 20
-1 -1 -1  2  5  8 21 
-1 -1 -1 13  6  7 22
-1 -1 -1 14 25 24 23
```

### Expected Solution Output

![Expected Output - Zip Puzzle](image1)

---

## Algorithm

- The solver uses constraint propagation and backtracking to find a valid consecutive path.
- **Time Complexity:** O(c^{n^2}), where c is a branching factor and n is the grid size.
- **Space Complexity:** O(mn), for an m x n grid.

---

## How to Use

1. **Compile:**
   ```sh
   g++ -O2 -std=c++17 main.cpp -o zip_solver
   ```
2. **Run:**
   ```sh
   ./zip_solver input1.txt
   ```

---

## Project Structure

```
Linkedin_Zip_Solver/
│
├── main.cpp             # Main C++ solver
├── input1.txt           # Sample input file
├── README.md            # Project documentation
└── [other files]
```

---

🤝 **Contributing**

Pull requests and suggestions are welcome!  
Please open an issue for bug reports or discussion.

---

📄 **License**

MIT License
