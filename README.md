# ConnectFour
Connect_Four
Four in a row or Connect Four is a strategy game where you drop coins into a grid, trying to line up four of your coins before AI does.

🟡🔴 How to Play Connect Four

The Board Imagine a standing frame with 7 columns and 6 rows – like a big grid with empty slots. AI and you sit on opposite sides with a pile of colored discs (coins). One player uses red discs. AI uses yellow discs.

Players take turns, one after the other. On your turn, you pick a column and drop your disc into it. The disc slides straight down and rests in the lowest empty space of that column (like a coin in a piggy bank slot).

The Goal The aim is simple: be the first to make a line of 4 discs.

The line can be horizontal (side by side), vertical (stacked up), or diagonal (slanting left or right).

Blocking Opponent Just like you’re trying to make your 4-in-a-row, your opponent is trying the same. So part of the game is not just making your line, but also blocking the other person before they succeed.

Winning the Game

The moment someone places the fourth disc in a row, they win instantly. If all columns are filled and no one made a line of four, the game is a draw.

🔹Minimax Algorithm in Connect Four:

One player (say Red) tries to maximize the score (best move for them), while the opponent (Yellow or AI) tries to minimize it (worst for Red, best for them). The game tree is built by simulating every possible move: At your turn, generate all legal moves (columns that aren’t full).

Drop your disc in each column and recursively evaluate the resulting position.

Assign a score:

+∞ if it’s a winning state for maximizing player. −∞ if it’s a winning state for minimizing player. 0 or heuristic score if game is ongoing or drawn.

Choose the move with the best evaluation depending on whose turn it is. Without optimization, Minimax explores the full game tree, which in Connect Four can grow huge (≈ 4.5 trillion possible positions).

🔹 Minimax with Alpha–Beta Pruning

Problem with plain Minimax: Too slow, because it examines every branch. Alpha–Beta pruning makes it efficient by cutting off branches that cannot influence the final decision. How Alpha–Beta Works:

Two values are tracked: Alpha (α) = the best score that the maximizing player can guarantee so far. Beta (β) = the best score that the minimizing player can guarantee so far.

When exploring the tree: If a move leads to a score worse than α or β, that branch is skipped (pruned).

Example: If the minimizing player already found a move that leads to a value less than the maximizing player’s current α, then the maximizing player will never choose this branch → prune it.

Benefits:

Same result as plain Minimax, but evaluates fewer nodes. In practice, Alpha–Beta pruning can reduce search time dramatically, especially if moves are ordered well (checking strong moves first).

Makes deeper lookahead possible → stronger AI.

🔹 Applying to Connect Four

Use Minimax with Alpha–Beta pruning for decision-making.

At each state:

Evaluate using a heuristic function when depth limit is reached.

Common heuristics:

+1000 for 4-in-a-row,

+100 for 3-in-a-row with open space,

+10 for 2-in-a-row,

Subtract equivalents for opponent.

Depth search is typically limited (e.g., 6–8 moves ahead), since exploring the full game tree is impractical.
