#include<bits/stdc++.h>
using namespace std;

vector<vector<int>> finalPath;
bool pathFound = false;

bool checkAllVisited(const vector<vector<bool>>& vis) {
    for (const auto& row : vis) {
        for (bool cell_vis : row) {
            if (!cell_vis) return false;
        }
    }
    return true;
}

bool isValidMove(int current_row, int current_col,
                 int next_row, int next_col,
                 int total_rows, int total_cols,
                 const vector<vector<bool>>& visited_spots,
                 const vector<vector<int>>& horizontal_walls,
                 const vector<vector<int>>& vertical_walls,
                 int last_number_in_path,
                 int new_spot_number,
                 int two_steps_back_row, int two_steps_back_col) {

    if (next_row < 0 || next_row >= total_rows || next_col < 0 || next_col >= total_cols) {
        return false;
    }

    if (visited_spots[next_row][next_col]) {
        return false;
    }

    if (next_row == two_steps_back_row && next_col == two_steps_back_col) {
        return false;
    }

    if (new_spot_number != -1 && new_spot_number < last_number_in_path) {
        return false;
    }

    if (next_col == current_col + 1) {
        if (current_col >= total_cols - 1 || horizontal_walls[current_row][current_col] == 1) return false;
    }
    else if (next_col == current_col - 1) {
        if (next_col < 0 || horizontal_walls[current_row][next_col] == 1) return false;
    }
    else if (next_row == current_row + 1) {
        if (current_row >= total_rows - 1 || vertical_walls[current_row][current_col] == 1) return false;
    }
    else if (next_row == current_row - 1) {
        if (next_row < 0 || vertical_walls[next_row][current_col] == 1) return false;
    }

    return true;
}

void solve(const vector<vector<int>>& map_numbers,
           const vector<vector<int>>& horizontal_walls,
           const vector<vector<int>>& vertical_walls,
           vector<vector<int>>& current_path,
           vector<vector<bool>>& visited_yet,
           int current_row, int current_col,
           int last_num_seen,
           int target_number) {

    if (pathFound) {
        return;
    }

    if (map_numbers[current_row][current_col] == target_number) {
        if (checkAllVisited(visited_yet)) {
            finalPath = current_path;
            pathFound = true;
        }
        if (pathFound) {
             return;
        }
    }

    int rows_count = map_numbers.size();
    int cols_count = map_numbers[0].size();

    int row_before_last = -1, col_before_last = -1;
    if (current_path.size() >= 2) {
        row_before_last = current_path[current_path.size() - 2][0];
        col_before_last = current_path[current_path.size() - 2][1];
    }

    int move_row[] = {-1, 1, 0, 0};
    int move_col[] = {0, 0, -1, 1};

    for (int i = 0; i < 4; ++i) {
        int new_row = current_row + move_row[i];
        int new_col = current_col + move_col[i];

        int num_at_new_spot = (new_row >= 0 && new_row < rows_count && new_col >= 0 && new_col < cols_count) ? map_numbers[new_row][new_col] : -2;

        if (isValidMove(current_row, current_col, new_row, new_col, rows_count, cols_count,
                        visited_yet, horizontal_walls, vertical_walls,
                        last_num_seen, num_at_new_spot,
                        row_before_last, col_before_last)) {

            visited_yet[new_row][new_col] = true;
            current_path.push_back({new_row, new_col});

            solve(map_numbers, horizontal_walls, vertical_walls, current_path, visited_yet,
                  new_row, new_col, max(last_num_seen, map_numbers[new_row][new_col]),
                  target_number);

            if (pathFound) {
                return;
            }

            current_path.pop_back();
            visited_yet[new_row][new_col] = false;
        }
    }
}

void printMatrix(const vector<vector<int>>& the_map, const vector<vector<int>>& path_coords, int m, int n) {
    vector<vector<char>> display_grid(m, vector<char>(n, '.'));

    for (size_t i = 0; i < path_coords.size(); ++i) {
        int r = path_coords[i][0];
        int c = path_coords[i][1];

        if (the_map[r][c] != -1) {
            display_grid[r][c] = (char)(the_map[r][c] + '0');
        } else {
            if (i < path_coords.size() - 1) {
                int next_r = path_coords[i+1][0];
                int next_c = path_coords[i+1][1];

                if (next_c == c + 1) {
                    display_grid[r][c] = '>';
                } else if (next_c == c - 1) {
                    display_grid[r][c] = '<';
                } else if (next_r == r + 1) {
                    display_grid[r][c] = 'v';
                } else if (next_r == r - 1) {
                    display_grid[r][c] = '^';
                }
            } else {
                display_grid[r][c] = 'X';
            }
        }
    }

    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            cout << display_grid[i][j] << " ";
        }
        cout << endl;
    }
}


int main() {
    int m_rows, n_cols;
    cin >> m_rows >> n_cols;

    vector<vector<int>> the_map(m_rows, vector<int>(n_cols));
    vector<vector<int>> h_walls(m_rows, vector<int>(n_cols));
    vector<vector<int>> v_walls(m_rows, vector<int>(n_cols));

    for (int i = 0; i < m_rows; ++i) {
        for (int j = 0; j < n_cols; ++j) {
            cin >> the_map[i][j];
        }
    }

    for (int i = 0; i < m_rows; ++i) {
        for (int j = 0; j < n_cols; ++j) {
            cin >> h_walls[i][j];
        }
    }

    for (int i = 0; i < m_rows; ++i) {
        for (int j = 0; j < n_cols; ++j) {
            cin >> v_walls[i][j];
        }
    }

    vector<vector<int>> current_trying_path;
    vector<vector<bool>> visited_cells(m_rows, vector<bool>(n_cols, false));

    int start_row = -1;
    int start_col = -1;
    int target_number = 0;

    for (int i = 0; i < m_rows; ++i) {
        for (int j = 0; j < n_cols; ++j) {
            if (the_map[i][j] == 1) {
                start_row = i;
                start_col = j;
            }
            if (the_map[i][j] != -1) {
                target_number = max(target_number, the_map[i][j]);
            }
        }
    }

    if (start_row == -1) {
        cout << "Error: Starting point (value 1) not found in matrix." << endl;
        return 1;
    }

    current_trying_path.push_back({start_row, start_col});
    visited_cells[start_row][start_col] = true;

    solve(the_map, h_walls, v_walls, current_trying_path, visited_cells,
          start_row, start_col, the_map[start_row][start_col], target_number);

    if (pathFound) {
        printMatrix(the_map, finalPath, m_rows, n_cols);
    } else {
        cout << "No way to visit all cells with these rules. No path found!" << endl;
    }

    return 0;
}
