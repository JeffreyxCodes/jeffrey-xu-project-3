$(function() {
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
        $container: $('.game-container'),

        resetGrid: function() {
            for (let i = 0; i < 10; i++) {
                this.grid.push((new Array(10)).fill(0));
            };
        },

        setStartPosition: function(i, j) {
            this.path.push([i, j]);
            this.grid[i][j] = 3;
            this.player.push(i, j);
        },

        findFreeTiles: function(x, y) {
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

        setPath: function() {
            let [x, y] = this.path[0]; // start point
            let freeTiles;

            freeTiles = this.findFreeTiles(x, y);
            do {
                [x, y] = freeTiles[Math.floor(Math.random() * freeTiles.length)];
                this.path.push([x, y]);
                this.grid[x][y] = 1;
                freeTiles = this.findFreeTiles(x, y);
            } while(freeTiles.length !== 0);
            this.grid[x][y] = 4; // end point
            this.pathTiles = this.path.length - 1; // number of steps to complete level
        },

        drawGrid: function() {
            let value;
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    value = this.grid[i][j];
                    // storing i,j in id and value respectively instead of together
                    // because I think accessing two different attributes is more
                    // efficient than converting a string to an array and vice versa
                    if (value === 0) {
                        this.$container.append(
                            `<div id="${i}" value=${j}></div>`
                        );
                    } else if ( value === 1) {
                        this.$container.append(
                            `<div class="untrigger" id="${i}" value=${j}></div>`
                        );
                    } else if (value === 3) {
                        this.$container.append(
                            `<div class="start-tile" id="${i}" value=${j}></div>`
                        ); 
                    } else {
                        this.$container.append(
                            `<div class="end-tile" id="${i}" value=${j}></div>`
                        );  
                    }
                }
            }
        },

        drawPlayer: function() {
            // console.log($(`.game-container div:nth-child(${this.player[0] * this.grid.length + this.player[1] + 1})`));
            $(`.game-container div:nth-child(${this.player[0] * this.grid.length + this.player[1] + 1})`).append(
                `<div class="player"></div>`
            );
        },

        initListener: function() {
            this.$container.on("click", function(e) {
                // check if the clicked tile is adjacent to the player
                // if () {

                // }
            });
        },

        init: function() {
            this.resetGrid();
            this.setStartPosition(4, 4);
            this.setPath();
            this.drawGrid();
            this.initListener();
            this.drawPlayer();

            console.log(this.grid);
        }
    };

    game.init();
});