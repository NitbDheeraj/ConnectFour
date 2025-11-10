/**
 * Minimax Implementation 
 * @jQuery version
 */
function Game() {
    this.rows = 6; // Height
    this.columns = 7; // Width
    this.status = 0; // 0: running, 1: won, 2: lost, 3: tie
    this.depth = 4; // Search depth
    this.score = 100000, // Win/loss score
    this.round = 0; // 0: Human, 1: Computer
    this.winning_array = []; // Winning (chips) array
    this.iterations = 0; // Iteration count
    
    that = this;

    that.init();
}

Game.prototype.init = function() {
    // Generate 'real' board
    // Create 2-dimensional array
    var game_board = new Array(that.rows);
    for (var i = 0; i < game_board.length; i++) {
        game_board[i] = new Array(that.columns);

        for (var j = 0; j < game_board[i].length; j++) {
            game_board[i][j] = null;
        }
    }

    // Create from board object (see board.js)
    this.board = new Board(this, game_board, 0);

    // Generate visual board
    var game_board_html = "<col/><col/><col/><col/><col/><col/><col/>";
    for (var i = 0; i < that.rows; i++) {
        game_board_html += "<tr>";
        for (var j = 0; j < that.columns; j++) {
            game_board_html += "<td class='empty' data-row='" + i + "' data-col='" + j + "'></td>";
        }
        game_board_html += "</tr>";
    }

    document.getElementById('game_board').innerHTML = game_board_html;

    // Generate mobile controls
    var mobile_html = '';
    for (var j = 0; j < that.columns; j++) {
        mobile_html += '<button class="mobile-column-btn" data-column="' + j + '">' + (j + 1) + '</button>';
    }
    document.getElementById('mobile-controls').innerHTML = mobile_html;

    // Action listeners for desktop
    var td = document.getElementById('game_board').getElementsByTagName("td");

    for (var i = 0; i < td.length; i++) {
        if (td[i].addEventListener) {
            td[i].addEventListener('click', that.act, false);
        } else if (td[i].attachEvent) {
            td[i].attachEvent('click', that.act)
        }
    }

    // Action listeners for mobile buttons
    var mobile_buttons = document.getElementsByClassName('mobile-column-btn');
    for (var i = 0; i < mobile_buttons.length; i++) {
        if (mobile_buttons[i].addEventListener) {
            mobile_buttons[i].addEventListener('click', function(e) {
                var column = parseInt(this.getAttribute('data-column'));
                that.place(column);
            }, false);
        }
    }

    // Update current player display
    that.updatePlayerDisplay();
    that.enableBoard();
}

/**
 * Update current player display
 */
Game.prototype.updatePlayerDisplay = function() {
    var playerDisplay = document.getElementById('current-player');
    if (that.status === 0) {
        if (that.round == 0) {
            playerDisplay.innerHTML = '<span class="player-indicator human-indicator"></span> Your Turn';
            playerDisplay.style.color = '#2c3e50';
        } else {
            playerDisplay.innerHTML = '<span class="player-indicator cpu-indicator"></span> AI\'s Turn';
            playerDisplay.style.color = '#e74c3c';
        }
    }
}

/**
 * Enable/disable the game board
 */
Game.prototype.enableBoard = function() {
    var cells = document.getElementById('game_board').getElementsByTagName('td');
    var mobileButtons = document.getElementsByClassName('mobile-column-btn');
    
    if (that.status === 0) {
        // Enable board
        for (var i = 0; i < cells.length; i++) {
            cells[i].style.cursor = 'pointer';
            cells[i].style.opacity = '1';
            cells[i].classList.remove('disabled');
        }
        for (var i = 0; i < mobileButtons.length; i++) {
            mobileButtons[i].disabled = false;
            mobileButtons[i].style.opacity = '1';
            mobileButtons[i].style.cursor = 'pointer';
        }
        document.getElementById('game_board').style.opacity = '1';
    } else {
        // Disable board
        for (var i = 0; i < cells.length; i++) {
            cells[i].style.cursor = 'not-allowed';
            cells[i].style.opacity = '0.7';
            cells[i].classList.add('disabled');
        }
        for (var i = 0; i < mobileButtons.length; i++) {
            mobileButtons[i].disabled = true;
            mobileButtons[i].style.opacity = '0.5';
            mobileButtons[i].style.cursor = 'not-allowed';
        }
        document.getElementById('game_board').style.opacity = '0.9';
    }
}

/**
 * On-click event
 */
Game.prototype.act = function(e) {
    // Don't allow moves if game is over
    if (that.status !== 0) return;
    
    var element = e.target || window.event.srcElement;

    // Check if not in animation and start with human
    if (!($('#coin').is(":animated"))) {
        if (that.round == 0) {
            var column = parseInt(element.getAttribute('data-col'));
            that.place(column);
        }
    }
}

/**
 * Get the actual pixel position of a cell
 */
Game.prototype.getCellPosition = function(row, column) {
    var boardElement = document.getElementById('game_board');
    var cell = boardElement.rows[row].cells[column];
    var boardRect = boardElement.getBoundingClientRect();
    var cellRect = cell.getBoundingClientRect();
    
    return {
        left: cellRect.left - boardRect.left,
        top: cellRect.top - boardRect.top
    };
}

/**
 * Place coin
 */
Game.prototype.place = function(column) {
    // Don't allow moves if game is over
    if (that.status !== 0) return;
    
    // If not finished
    if (that.board.score() != that.score && that.board.score() != -that.score && !that.board.isFull()) {
        for (var y = that.rows - 1; y >= 0; y--) {
            if (document.getElementById('game_board').rows[y].cells[column].className == 'empty') {
                if (that.round == 1) {
                    // AI's turn
                    var pos = that.getCellPosition(y, column);
                    
                    $('#coin').attr('class', 'cpu-coin').css({
                        'left': pos.left + 'px',
                        'top': '0px'
                    }).fadeIn('fast').animate({
                        'top': pos.top + 'px'
                    }, 700, 'easeOutBounce', function() {
                        document.getElementById('game_board').rows[y].cells[column].className = 'coin cpu-coin';
                        $('#coin').hide().css({'top': '0px'});
                        
                        if (!that.board.place(column)) {
                            return;
                        }

                        that.round = that.switchRound(that.round);
                        that.updatePlayerDisplay();
                        that.updateStatus();
                    });
                } else {
                    // Human's turn
                    var pos = that.getCellPosition(y, column);
                    
                    $('#coin').attr('class', 'human-coin').css({
                        'left': pos.left + 'px',
                        'top': '0px'
                    }).fadeIn('fast').animate({
                        'top': pos.top + 'px'
                    }, 700, 'easeOutBounce', function() {
                        document.getElementById('game_board').rows[y].cells[column].className = 'coin human-coin';
                        $('#coin').hide().css({'top': '0px'});
                        
                        if (!that.board.place(column)) {
                            return;
                        }

                        that.round = that.switchRound(that.round);
                        that.updatePlayerDisplay();
                        that.updateStatus();
                        
                        // AI's turn after human move
                        if (that.status === 0) {
                            that.generateComputerDecision();
                        }
                    });
                }
                break;
            }
        }
    }
}

Game.prototype.generateComputerDecision = function() {
    if (that.board.score() != that.score && that.board.score() != -that.score && !that.board.isFull() && that.status === 0) {
        that.iterations = 0; // Reset iteration count
        document.getElementById('loading').style.display = "block"; // Loading message

        // AI is thinking
        setTimeout(function() {
            // Debug time
            var startzeit = new Date().getTime();

            // Algorithm call
            var ai_move = that.maximizePlay(that.board, that.depth);

            var laufzeit = new Date().getTime() - startzeit;
            document.getElementById('ai-time').innerHTML = laufzeit.toFixed(2);

            // Place ai decision
            that.place(ai_move[0]);

            // Debug
            document.getElementById('ai-column').innerHTML = parseInt(ai_move[0] + 1);
            document.getElementById('ai-score').innerHTML = ai_move[1];
            document.getElementById('ai-iterations').innerHTML = that.iterations;

            document.getElementById('loading').style.display = "none"; // Remove loading message
        }, 100);
    }
}

/**
 * Algorithm
 * Minimax principle
 */
Game.prototype.maximizePlay = function(board, depth) {
    // Call score of our board
    var score = board.score();

    // Break
    if (board.isFinished(depth, score)) return [null, score];

    // Column, Score
    var max = [null, -99999];

    // For all possible moves
    for (var column = 0; column < that.columns; column++) {
        var new_board = board.copy(); // Create new board

        if (new_board.place(column)) {

            that.iterations++; // Debug

            var next_move = that.minimizePlay(new_board, depth - 1); // Recursive calling

            // Evaluate new move
            if (max[0] == null || next_move[1] > max[1]) {
                max[0] = column;
                max[1] = next_move[1];
            }
        }
    }

    return max;
}

Game.prototype.minimizePlay = function(board, depth) {
    var score = board.score();

    if (board.isFinished(depth, score)) return [null, score];

    // Column, score
    var min = [null, 99999];

    for (var column = 0; column < that.columns; column++) {
        var new_board = board.copy();

        if (new_board.place(column)) {

            that.iterations++;

            var next_move = that.maximizePlay(new_board, depth - 1);

            if (min[0] == null || next_move[1] < min[1]) {
                min[0] = column;
                min[1] = next_move[1];
            }
        }
    }
    return min;
}

Game.prototype.switchRound = function(round) {
    // 0 Human, 1 Computer
    if (round == 0) {
        return 1;
    } else {
        return 0;
    }
}

Game.prototype.updateStatus = function() {
    var message = "";
    
    // Human won
    if (that.board.score() == -that.score) {
        that.status = 1;
        that.markWin();
        message = "Congratulations! You won!";
    }

    // Computer won
    if (that.board.score() == that.score) {
        that.status = 2;
        that.markWin();
        message = "Game Over! AI won!";
    }

    // Tie
    if (that.board.isFull() && that.status === 0) {
        that.status = 3;
        message = "It's a tie!";
    }

    // Update status display
    var html = document.getElementById('status');
    var playerDisplay = document.getElementById('current-player');
    
    if (that.status == 0) {
        html.className = "status-running";
        html.innerHTML = "Running";
        that.updatePlayerDisplay();
    } else if (that.status == 1) {
        html.className = "status-won";
        html.innerHTML = "You Won!";
        playerDisplay.innerHTML = '<span class="player-indicator human-indicator"></span> You Won!';
        playerDisplay.style.color = '#27ae60';
    } else if (that.status == 2) {
        html.className = "status-lost";
        html.innerHTML = "You Lost";
        playerDisplay.innerHTML = '<span class="player-indicator cpu-indicator"></span> AI Won!';
        playerDisplay.style.color = '#e74c3c';
    } else {
        html.className = "status-tie";
        html.innerHTML = "Tie Game";
        playerDisplay.innerHTML = 'Game Tied!';
        playerDisplay.style.color = '#f39c12';
    }

    // Disable board if game is over
    if (that.status !== 0) {
        that.enableBoard();
    }
}

Game.prototype.markWin = function() {
    // Highlight winning coins with animation
    for (var i = 0; i < that.winning_array.length; i++) {
        var row = that.winning_array[i][0];
        var col = that.winning_array[i][1];
        var cell = document.getElementById('game_board').rows[row].cells[col];
        var currentClass = cell.className;
        
        // Remove any existing win class and add it fresh
        cell.className = currentClass.replace(' win', '') + ' win';
    }
}

Game.prototype.restartGame = function() {
    // Reset game state completely
    that.status = 0;
    that.round = 0;
    that.winning_array = [];
    that.iterations = 0;
    
    // Get current difficulty
    var difficulty = document.getElementById('difficulty');
    that.depth = parseInt(difficulty.options[difficulty.selectedIndex].value);
    
    // Clear the visual board
    var cells = document.getElementById('game_board').getElementsByTagName('td');
    for (var i = 0; i < cells.length; i++) {
        cells[i].className = 'empty';
        cells[i].classList.remove('disabled');
    }
    
    // Reset the game board data structure
    var new_game_board = new Array(that.rows);
    for (var i = 0; i < new_game_board.length; i++) {
        new_game_board[i] = new Array(that.columns);
        for (var j = 0; j < new_game_board[i].length; j++) {
            new_game_board[i][j] = null;
        }
    }
    
    // Create new board instance
    that.board = new Board(that, new_game_board, 0);
    
    // Reset UI elements
    document.getElementById('ai-iterations').innerHTML = "?";
    document.getElementById('ai-time').innerHTML = "?";
    document.getElementById('ai-column').innerHTML = "?";
    document.getElementById('ai-score').innerHTML = "?";
    
    // Update displays
    that.updatePlayerDisplay();
    that.updateStatus();
    that.enableBoard();
    
    // Hide loading if it's showing
    document.getElementById('loading').style.display = "none";
    
    // Reset coin position
    $('#coin').hide().css({'top': '0px'});
    
    console.log("Game restarted successfully!");
}

/**
 * Start game
 */
function Start() {
    window.Game = new Game();

    // Hover background, now using jQuery
    $('td').hover(function() {
        if (window.Game && window.Game.status === 0) {
            $(this).parents('table').find('col:eq('+$(this).index()+')').toggleClass('hover');
        }
    });
    
    // Add restart button event listener
    document.querySelector('.btn-primary').addEventListener('click', function() {
        if (window.Game) {
            window.Game.restartGame();
        }
    });
}

window.onload = function() {
    Start()
};