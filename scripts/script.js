const game = {
    grid: [],
    // 0: field tile - black
    // 1: untrigger tile - orange
    // 2: triggered tile - firebrick
    // 3: start tile - gray
    // 4: end tile - green
    path: [],
    pathTiles: 0,
    player: [],
    level: -99,
    score: 0,
    direction: 0,
    spriteSetMultiplier: 100 / 7,
    moveEnded: true,
    $level: $('.level'),
    $score: $('.score'),
    $container: $('.game-container'),
    $player: undefined,
    $sprite: undefined,

    // create the 2d array used for the grid
    initGrid: function () {
        for (let i = 0; i < 10; i++) {
            this.grid.push((new Array(10)).fill(0));
        };
    },

    // set the start tile
    setStartPosition: function (x, y) {
        this.path = []; // for when the game resets
        this.path.push([x, y]);
        this.grid[x][y] = 3;
        this.player = [] // for when the game resets
        this.player.push(x, y);
    },

    // find available tiles to move onto that's beside the given tile position
    findFreeTiles: function (x, y) {
        const freeTiles = [];
        if (x - 1 >= 0 && this.grid[x - 1][y] === 0) {
            freeTiles.push([x - 1, y]);
        }
        if (x + 1 < this.grid[0].length && this.grid[x + 1][y] === 0) {
            freeTiles.push([x + 1, y]);
        }
        if (y - 1 >= 0 && this.grid[x][y - 1] === 0) {
            freeTiles.push([x, y - 1]);
        }
        if (y + 1 < this.grid[0].length && this.grid[x][y + 1] === 0) {
            freeTiles.push([x, y + 1]);
        }
        return freeTiles;
    },

    // build a traversal path
    setPath: function () {
        let [x, y] = this.path[0]; // start point
        let freeTiles = this.findFreeTiles(x, y);

        do {
            [x, y] = freeTiles[Math.floor(Math.random() * freeTiles.length)];
            this.path.push([x, y]);
            this.grid[x][y] = 1;
            freeTiles = this.findFreeTiles(x, y);
        } while (freeTiles.length !== 0);
        this.grid[x][y] = 4; // end point
        this.pathTiles = this.path.length;
    },

    // displays the grid - only used for the initial start of the app
    drawGrid: function () {
        let value;
        for (let i = 0; i < 10; i++) { // y axis
            for (let j = 0; j < 10; j++) { // x axis
                value = this.grid[j][i];
                this.drawTile(value, j, i);
            }
        }

        // calculate and set the size of each tile
        this.tileSize = this.$container.innerWidth() / 10;

        this.addPlayer();
    },

    // draw a tile given the type in terms of value and the tiles position
    // - only used for the initial start of the app
    drawTile: function (value, x, y) {
        if (value === 0) {
            this.$container.append(
                `<button data-position="${x},${y}" aria-label="invalid tile"></button>`
            );
        } else if (value === 1) {
            this.$container.append(
                `<button class="untrigger" data-position="${x},${y}" aria-label="untriggered tile at position (${x},${y})"></button>`
            );
        } else if (value === 3) {
            this.$container.append(
                `<button class="start-tile" data-position="${x},${y}" aria-label="start-tile at position (${x},${y})"></button>`
            );
        } else {
            this.$container.append(
                `<button class="end-tile" data-position="${x},${y}" aria-label="end-tile at position (${x},${y})"></button>`
            );
        }
    },

    // reset the grid's value 
    resetGrid: function () {
        const tiles = this.path.length;
        for (let i = 0; i < tiles; i++) {
            this.grid[this.path[i][0]][this.path[i][1]] = 0;
            this.updateTile("", this.path[i][0], this.path[i][1]);
        }
    },

    // update the tile given the type and position
    updateTile: function (type, x, y) {
        $(`[data-position="${x},${y}"]`).attr(`class`, type);
        $(`[data-position="${x},${y}"]`).attr(`aria-label`, `${type} tile at position (${x},${y})`);
    },

    // update the grid
    updateGrid: function() {
        // update grid for the next round with new values from path
        let value;
        for (let i = 0; i < this.pathTiles; i++) {
            value = this.grid[this.path[i][0]][this.path[i][1]];
            if(value === 1) {
                this.updateTile(`untrigger`, ...this.path[i]);
            } else if(value === 3) {
                this.updateTile(`start-tile`, ...this.path[i]);
            } else if(value === 4){
                this.updateTile(`end-tile`, ...this.path[i]);
            }
        }

        this.addPlayer();
    },

    // setup for a new level
    newLevel: function(level, score) {
        // set the level and score
        this.level = level;
        this.$level.text(this.level);
        this.score = score
        this.$score.text(this.score);

        // win if level = 0, display win modal
        if (level === 0) {
            $(`.win-container`).slideDown();
        }

        // reset the grid
        this.resetGrid();

        // setup the path, grid, and player on the grid
        this.setStartPosition(Math.floor(Math.random() * this.grid.length), Math.floor(Math.random() * this.grid.length));
        this.setPath();
        this.removePlayer();
        this.updateGrid();

        // reset the gate to be closed
        this.$container[0].style.setProperty("--end-tile-url", "url('../assets/close.png')");

        // allow player to move
        this.moveEnded = true;

    },

    // animate the player
    drawPlayer: function () {
        // change sprite sheet location to reflect direction
        this.$sprite[0].style.setProperty("--sprite-set", `${this.direction}%`);

        this.$player.css({
            "left": `${this.tileSize * (this.player[0])}px`,
            "top": `${this.tileSize * (this.player[1])}px`
        });
    },

    // move the player and update values accordingly
    movePlayer: function (type, x, y) {
        if (this.moveEnded) { // checks if previous move have finished first
            this.moveEnded = false;

            this.pathTiles--;
            if (this.pathTiles === 2) { // gate is open when all tiles have been stepped on
                this.$container[0].style.setProperty("--end-tile-url", "url('../assets/open.png')");
            }
            this.grid[x][y] = 2;
            this.player = [x, y];
            this.updateTile(type, x, y);
            this.drawPlayer();
        }
    },

    // check if there's an available adjacent tile and move player if there is;
    checkAdjacent: function (distance, eX, eY, direction) {
        if (distance === 1) { // distance of 1 from player
            this.direction = direction;

            if (this.grid[eX][eY] === 1) { // step on an untrigger tile
                this.movePlayer(`triggered`, eX, eY);
            } else if (this.pathTiles === 2 && this.grid[eX][eY] === 4) { // able to take last step
                this.movePlayer(`end-tile`, eX, eY);
                this.newLevel(this.level + 1, this.score + this.path.length - 1);
            } 
        }
    },

    // adds player onto grid
    addPlayer: function() {
        this.$container.append(
            `<button 
                class="player" 
                data-x='${this.player[0]}'
                data-y='${this.player[1]}'
                style="left: ${this.player[0] * this.tileSize}px; top: ${this.player[1] * this.tileSize}px"
                aria-label="player at position (${this.player.toString()})">
                <div class="player-sprite"></div></button>`
        );
        this.$player = $('.player');
        this.$sprite = $('.player-sprite');
    },

    // remove the player
    removePlayer: function () {
        $(`.player`).remove();
    },

    // initialize all the click events
    initClick: function () {
        // initialize the button to start the game
        $('.ready').on('click', () => {
            $('.title').animate({
                fontSize: $(document).width() > 600 ? '1rem' : '0.85rem',
                top: 2,
            }, {
                duration: 0, //1500
                complete: () => {
                    $('.title').css('position', 'relative');
                    $('.intro-container').slideUp();
                }
            })

            $('.back').animate({
                top: '-1.3rem'
            }, {
                duration: 0 //1500
            });

            $('.ready').remove();
        });

        // initialize the button to continue the game
        $('.continue').on('click', () => {
            $('.intro-container').slideUp();
            $('.win-container').slideUp();
        });



        // initialize click event for the tiles
        this.$container.on('click', 'button', (e) => {
            if (e.target.className !== 'player') {
                let [eX, eY] = e.target.dataset.position.split(`,`);
                [eX, eY] = [Number(eX), Number(eY)];
                const [pX, pY] = this.player;
                let distance = 0;
                let direction;

                // check if the clicked tile is adjacent to the player
                if (eX === pX) { // same row as player
                    distance = eY - pY;
                    direction = distance > 0 ? this.spriteSetMultiplier * 4 : this.spriteSetMultiplier * 5;
                    this.checkAdjacent(Math.abs(distance), eX, eY, direction);
                } else if (eY === pY) { // same column as player
                    distance = eX - pX;
                    direction = distance > 0 ? 100 : this.spriteSetMultiplier * 6;
                    this.checkAdjacent(Math.abs(distance), eX, eY, direction);
                }
            }
        });

        // initialize click event for the virtual arrow keys
        $(`#arrow-keys`).on(`click`, `button`, (e) => {
            const [x, y] = this.player;
            if (e.currentTarget.className === `left`) {
                this.checkAdjacent(1, x - 1, y, this.spriteSetMultiplier * 6);
            } else if (e.currentTarget.className === `up`) {
                this.checkAdjacent(1, x, y - 1, this.spriteSetMultiplier * 5);
            } else if (e.currentTarget.className === `right`) {
                this.checkAdjacent(1, x + 1, y, 100);
            } else {
                this.checkAdjacent(1, x, y + 1, this.spriteSetMultiplier * 4);
            }
        })

        // initialize the instructions button
        $(`.instructions`).on(`click`, () => {
            $(`.intro-container`).slideDown();
            $(`.intro`).css(`top`, `20vh`);
            $(`.continue`).show();
        });

        // initialize restart button
        $('.restart').on(`click`, () => {
            this.newLevel(-99, 0);
        });
    },

    // initialize the arrow keys on the keyboard
    initArrowKeys: function () {
        $(document).keyup((e) => {
            const [x, y] = this.player;
            if (e.keyCode === 37 && x > 0) { // left
                this.checkAdjacent(1, x - 1, y, this.spriteSetMultiplier * 6);
            } else if (e.keyCode === 38 && y > 0) { // up
                this.checkAdjacent(1, x, y - 1, this.spriteSetMultiplier * 5);
            } else if (e.keyCode === 39 && x < this.grid.length - 1) { // right
                this.checkAdjacent(1, x + 1, y, 100);
            } else if (e.keyCode === 40 && y < this.grid.length - 1) { // down
                this.checkAdjacent(1, x, y + 1, this.spriteSetMultiplier * 4);
            }
        });
    },

    // initialize the transitionend event listener to check if the player has finished moving
    initTransitionEnd: function () {
        $(document).on("transitionend", () => {
            if (!this.moveEnded) { // roughly check if the transition is from player movement
                this.moveEnded = true;
                this.direction = this.direction - this.spriteSetMultiplier * 4;
                this.$sprite[0].style.setProperty("--sprite-set", `${this.direction}%`);
            }
        });
    },

    // initialize the resize event listener to resize tile size
    initResize: function () {
        $(window).resize(() => {
            this.tileSize = this.$container.innerWidth() / 10;
            this.drawPlayer();
        });
    },

    // initialize the game
    init: function () {
        // setup the 2d array
        this.initGrid();
        // setup the game elements
        this.setStartPosition(Math.floor(Math.random() * this.grid.length), Math.floor(Math.random() * this.grid.length));
        this.setPath();
        this.drawGrid();

        // initialize event listener for transitionend and resize
        this.initTransitionEnd();
        this.initResize();

        // initialize the click events
        this.initClick();
        // initialize the arrow key events
        this.initArrowKeys();
    }
};

$(function() {
    game.init();
});