# Linkedin_Zip_Solver

A fast and extensible C++ solver for "Zip" logic puzzles as popularized on LinkedIn and other platforms, featuring sample input files and a clean codebase.  
This project is designed for both puzzle enthusiasts and algorithmic problem solvers.  
You’ll find **sample input files**, the **main solver code**, and a clear explanation of how everything fits together.

---

## Project Structure

```
Linkedin_Zip_Solver/
│
├── main.cpp             # Main solver implementation (entry point)
├── input1.txt           # Sample input file 1 (see below)
├── input2.txt           # Sample input file 2
├── ...                  # More sample inputs if present
├── README.md            # This documentation
└── [other files]
```

---

## How It Works

1. **Input**:  
   The solver reads an input file describing the puzzle grid, clues, and constraints.

2. **Processing**:  
   The core algorithm parses the grid, applies logical and/or search-based rules, and computes the solution.

3. **Output**:  
   The solution is printed to standard output and/or saved to a file.  
   Optionally, you can visualize the result in tabular or image form (see below for an example).

---

## Sample Input File Format

Each sample input file (e.g., `input1.txt`) represents a puzzle instance.  
**Example (`input1.txt`):**
```
4 4
1 0 0 2
0 0 0 0
0 0 0 0
3 0 0 4
```
- First line: grid dimensions (`rows cols`)
- Next lines: clues in the grid; `0` means empty

---

## Main Solver Code

The central logic is in `main.cpp`.  
It consists of:
- Input parsing
- Constraint propagation
- (Optionally) recursive backtracking or optimized search

**Simplified main loop:**
```cpp
int main() {
    auto grid = read_input("input1.txt");
    bool solved = solve_puzzle(grid);
    if (solved) print_solution(grid);
    else std::cout << "No solution found.\n";
    return 0;
}
```

---

## Example Output

Given the sample input above, the output might look like:
```
1 2 3 2
2 3 4 1
3 4 1 2
3 1 2 4
```

Or as an image/table:  
![Sample Solution](docs/sample_solution.png)  
*(Generate this with your favorite spreadsheet or code if needed)*

---

## Algorithm & Complexity

- **Approach**:  
  The solver uses constraint propagation with backtracking, optimized for grid-based logic puzzles.
- **Time Complexity**:  
  - Worst case: O(N!) for N cells (if brute force)
  - Practical: Much faster due to early pruning and domain reduction
- **Space Complexity**:  
  - O(N^2) for storing the grid and auxiliary data

---

## How to Run

1. **Compile:**
   ```sh
   g++ -O2 -std=c++17 main.cpp -o zip_solver
   ```
2. **Run:**
   ```sh
   ./zip_solver input1.txt
   ```

---

## Highlights for CV/Professional Use

- **Efficient C++ implementation** with clean code and modular structure.
- **Demonstrates strong problem solving and algorithmic skills**.
- **Includes sample inputs and outputs** for easy evaluation and testing.
- **Well-documented and ready for extension** to new puzzle types or larger grids.
- **Reusable as a library or CLI tool** for automation or integration.

---

## License

This project is licensed under the MIT License.

---

> For queries, suggestions, or contributions, open an issue or pull request on [GitHub](https://github.com/Shreyash39/Linkedin_Zip_Solver).
