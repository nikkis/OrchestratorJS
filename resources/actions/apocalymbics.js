module.exports = {

    exceptionHandler: function(action, device, exception_value) {
        console.log('error on client-side: '+ device.identity+', '+exception_value);
        action.finishAction();
    },

    eventHandler: function(action, device, event_value) {
        console.log('event from client: '+device.identity+', '+event_value);
    },
    
    
    // the body
    body: function (devices) {
        var p = console.log;
        var misc = require('./misc.js');


        var Constant = {uninitialized: -1, error:  -2};
        var Game     = {gameSkullThrow: 0};        

        function Player() { this.number     = Constant.uninitialized;
                            this.country    = Constant.uninitialized; 
                            this.device     = null; 
                            this.admin      = false; 
                            this.throwAngle = Constant.uninitialized; };


        /// game initialization

        var players = [];
        for(i in devices) {
            p(devices[i].identity);
            var player = new Player();
            player.device = devices[i];
            player.number = parseInt(i);
            players.push(player);

            player.device.apocalymbics.testLaunch();
        }

        for(i in players) {
            var player = players[i];
            player.device.apocalymbics.launchApplication(player.number);
        }


        // Randomize who gets to be the admin on first time
        var adminPlayerNumber = 1; //Math.floor(Math.random() * players.length-1) + 1;
        for(i in players) {
            var player = players[i];
            if(player.number == adminPlayerNumber) {
                player.device.apocalymbics.makeAdminPlayer();
                player.admin = true;
            } else {
                player.device.apocalymbics.makeNormalPlayer();
                player.admin = false;
            }
        }


        // Country selection for each player, player on first position in the array 
        // gets to start and others wait for their turn
        var allCountries = [];
        var allPlayerNumbers = [];
        for(i in players) {
            var player = players[i];
            var country = Constant.uninitialized;
            
            // Poll one player so long that he chooses a country and move to next player
            while(country == Constant.uninitialized) {
                country = player.device.apocalymbics.getCountrySelection();
                misc.sleep(1);
            }
            player.country = country;
            
            allCountries.push(country);
            allPlayerNumbers.push(player.number);
            
            // After the player has chosen his country, update the country selection
            // view for all players
            for(j in players) {
                var playerTemp = players[j];
                playerTemp.device.apocalymbics.updatePlayerInfo(allCountries, allPlayerNumbers);
            }
        }


        // Move players to the game selection screen
        for(i in players) {
            var player = players[i];
            player.device.apocalymbics.moveToGameSelectionScreen();
        }

        // Game selection for the party. Admin is the one who gets to choose the game
        var game = Constant.uninitialized;
        for(i in players) {
            var player = players[i];
            if(player.admin) {
                // Poll admin as long as he chooses a game
                while(game == Constant.uninitialized) {
                    game = player.device.apocalymbics.getGameSelectionFromAdmin();
                    misc.sleep(1);
                }

                // Update game selection for all players
                for(j in players) {
                    var playerTemp = players[j];
                    playerTemp.device.apocalymbics.updateGameSelection(game);
                }
            }
        }

//        misc.sleep(1);




        // This loop exists as long as there are at least 2 people who want to play.
        // This loop goes through the following phases:
        // - Game selection
        // - Game play
        // - Winner Screen
        // After winner screen, the loop begins again if 2 players want to continue playing
        while(players.length > 1) {


            // Check which players are still in game
            var countries = [];
            var playerNumbers = [];
            for(i in players) {
                var player = players[i];
                countries.push(player.country);
                playerNumbers.push(player.number);
            }

            // Tell every client which players are still in the game
            for(i in players) {
                var player = players[i];
                player.device.apocalymbics.updatePlayerInfo(countries, playerNumbers);
            }

            misc.sleep(1);
            
            // Move players to the game play screen. Clients know which
            // game to start because of earlier updateGameSelection(game number) call
            for(i in players) {
                var player = players[i];
                player.device.apocalymbics.moveToGameplayScreen();
            }
            

            misc.sleep(2);
            

            //############################################
            //# GAMEPLAY LOOP FOR EACH GAME STARTS HERE
            //############################################
            
            // Skull throw game was selected
            if(game == Game.gameSkullThrow ) {

// TODO:
                // Randomize player order
                //random.shuffle(players)
                var maxNumOfRounds = 3;
                var round = 1;
                while(round <= maxNumOfRounds) {
                    
                    // Inform clients which round is starting (round 1, 2 or 3)
                    for(i in players) {
                        var player = players[i];
                        player.device.apocalymbics.startRound(round);
                    }

                    // Give clients a little time to show round number for players
                    misc.sleep(1);
                        
                    // Loop every player's turn of current round
                    for(k in players) {
                        var currentPlayer = players[k];  
                        // Inform clients which player is in turn
                        for(j in players) {
                            var tempPlayer = players[j];
                            tempPlayer.device.apocalymbics.updateGameplayTurn(currentPlayer.number);
                        }
                        currentPlayer.throwAngle = Constant.uninitialized;
                        
                        // Get player's throw length
                        while(currentPlayer.throwAngle < 0) {
                            currentPlayer.throwAngle = currentPlayer.device.apocalymbics.getPlayerThrowAngle();
                            misc.sleep(1);
                        }
                        // Inform everyone how far the player managed to throw. Parameters playerNumber 
                        // and throwLength are used to update others of the throw length, and then 
                        // it is used to replicate player's throw.
                        // TODO: make thrower client ignore this and show the throw immediately
                        for(j in players) {
                            var tempPlayer = players[j];
                            tempPlayer.device.apocalymbics.showPlayerThrow(currentPlayer.number, currentPlayer.throwAngle);
                        }
                        // Wait for every client to show the throw before changing player turn
                        for(j in players) {
                            var tempPlayer = players[j];
                            var ready = false;
                            while(!ready) {
                                ready = tempPlayer.device.apocalymbics.isReady();
                                misc.sleep(2);
                            }
                        }
                    }
                    // Every player has thrown: next round
                    round += 1;
                }   
            } else {
                console.log("Game not IMPLEMENTED");
            }    
                
        
        
            //############################################
            //# WINNER SCREEN FUNCTIONALITY IS IMPLEMENTED HERE
            //############################################
        
            // The mini game has been played: move to winner screen.
            // Clients know the correct placement of players
            for(i in players) {
                var player = players[i];
                player.device.apocalymbics.moveToWinnerScreen();
            }
            // While clients are in winner screen, make winner admin
            // and others normal players
            for(i in players) {
                var player = players[i];
                var playerPlacement = Constant.uninitialized;
                var playerPlacement = player.device.apocalymbics.getPlayerPlacement();
                
                if(playerPlacement == 1) {
                    player.device.apocalymbics.makeAdminPlayer();
                    player.admin = true;
                } else {
                    player.device.apocalymbics.makeNormalPlayer();
                    player.admin = false;
                }
            }     
            // Game selection for the party. Winner gets to choose the game
            game = Constant.uninitialized;
            for(i in players) {
                var player = players[i];
                if(player.admin) {
                    // Poll admin as long as he chooses a game
                    while(game == Constant.uninitialized) {
                        game = player.device.apocalymbics.getGameSelectionFromAdmin();
                        misc.sleep(1);
                    }
                
                    // Update game selection for all players
                    for(j in players) {
                        var tempPlayer = players[j];
                        tempPlayer.device.apocalymbics.updateGameSelection(game);
                    }
                }
            }
            // Move to Play Again Screen
            for(i in players) {
                var player = players[i];
                player.device.apocalymbics.moveToPlayAgainScreen();
            }

            misc.sleep(10);
        
        }

    },

};