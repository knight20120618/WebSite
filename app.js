var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.get('/favicon.ico', (req, res) => {    // favicon.ico路由
    res.sendFile(path.join(__dirname, 'favicon.ico'));
});

var cookieParser = require('cookie-parser');
app.use(express.json());    // 解析JSON格式
app.use(cookieParser());    // 使用cookies

function OK(req, res, next) {    // 判斷是否存在cookies
    if (req.cookies && req.cookies.XD === '17') {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');    // 瀏覽器避免緩存
        next();
    } else {
        res.redirect('/17/enter.html');
    }
}

app.get('/login', (req, res) => {    // LOGIN路由
    if (req.cookies && req.cookies.XD === '17') {
        res.render('17');
    }
    res.redirect('/17/enter.html');
});
app.post('/login', (req, res) => {    // 判斷帳號密碼
    var { username, password } = req.body;
    if (username === '17' && password === '17') {
        res.cookie('XD', '17');
        res.json({ success: true, redirect: '/17' });
    } else {
        res.json({ success: false, message: '帳號或密碼錯誤' });
    }
});
app.get('/17', OK, (req, res) => {    // 判斷是否透過登入帳號密碼及是否存在cookies
    res.render('17');
});
app.get('/logout', (req, res) => {    // LOGOUT路由
    res.clearCookie('XD');
    res.json({ success: true, redirect: '/17/enter.html' });
});

app.set('view engine', 'ejs');    // JAVASCRIPT模板引擎
app.set('views', __dirname + '/views');
var bodyParser = require('body-parser');    // 解析表單
app.use(bodyParser.urlencoded({ extended: true }));
var mariadb = require('mariadb');
var pool = mariadb.createPool({    // mariadb連線設定
    host: '127.0.0.1',
    user: 'root',
    password: '17',
    database: 'cpbldb'
});

app.get('/17teams', OK, (req, res) => {    // 球團資料(管理者)
    pool.getConnection()
        .then(conn => {
            conn.query('SELECT * FROM teams')
                .then(results => {
                    conn.release();
                    res.render('17teams', { results, message: 'SUCCESS' });
                })
                .catch(err => {
                    conn.release();
                    console.error('查詢失敗', err);
                });
        })
        .catch(err => {
            console.error('連線失敗', err);
        });
});
app.post('/teams', (req, res) => {    // 球團資料處理(管理者)
    var { insert, update, cut, teamsid, year, who, total, win, draw, loss } = req.body;

    if (insert) {
        pool.getConnection()
            .then(conn => {
                conn.query('INSERT INTO teams (teamsid, year, who, total, win, draw, loss) VALUES (?, ?, ?, ?, ?, ?, ?)', [teamsid, year, who, total, win, draw, loss])
                    .then(() => {
                        conn.release();
                        res.redirect('/17teams');
                    })
                    .catch(err => {
                        conn.release();
                        console.error('新增失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    }
    else if (cut) {
        pool.getConnection()
            .then(conn => {
                conn.query('DELETE FROM teams WHERE teamsid = ?', [teamsid])
                    .then(() => {
                        conn.release();
                        res.redirect('/17teams');
                    })
                    .catch(err => {
                        conn.release();
                        console.error('刪除失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    }
    else if (update) {
        pool.getConnection()
            .then(conn => {
                conn.query('UPDATE teams SET year = ?, who = ?, total = ?, win = ?, draw = ?, loss = ? WHERE teamsid = ?', [year, who, total, win, draw, loss, teamsid])
                    .then(() => {
                        conn.release();
                        res.redirect('/17teams');
                    })
                    .catch(err => {
                        conn.release();
                        console.error('更新失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    }
});
app.get('/17players', OK, (req, res) => {    // 球員資料(管理者)
    pool.getConnection()
        .then(conn => {
            conn.query('SELECT * FROM players')
                .then(results => {
                    conn.release();
                    res.render('17players', { results, message: 'SUCCESS' });
                })
                .catch(err => {
                    conn.release();
                    console.error('查詢失敗', err);
                });
        })
        .catch(err => {
            console.error('連線失敗', err);
        });
});
app.post('/players', (req, res) => {    // 球員資料處理(管理者)
    var { insert, update, cut, playersid, teamsid, number, name, field, habit } = req.body;

    if (insert) {
        pool.getConnection()
            .then(conn => {
                conn.query('INSERT INTO players (playersid, teamsid, number, name, field, habit) VALUES (?, ?, ?, ?, ?, ?)', [playersid, teamsid, number, name, field, habit])
                    .then(() => {
                        conn.release();
                        res.redirect('/17players');
                    })
                    .catch(err => {
                        conn.release();
                        console.error('新增失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    }
    else if (cut) {
        pool.getConnection()
            .then(conn => {
                conn.query('DELETE FROM players WHERE playersid = ?', [playersid])
                    .then(() => {
                        conn.release();
                        res.redirect('/17players');
                    })
                    .catch(err => {
                        conn.release();
                        console.error('刪除失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    }
    else if (update) {
        pool.getConnection()
            .then(conn => {
                conn.query('UPDATE players SET teamsid = ?, number = ?, name = ?, field = ?, habit = ? WHERE playersid = ?', [teamsid, number, name, field, habit, playersid])
                    .then(() => {
                        conn.release();
                        res.redirect('/17players');
                    })
                    .catch(err => {
                        conn.release();
                        console.error('更新失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    }
});
app.get('/17games', OK, (req, res) => {    // 比賽資料(管理者)
    pool.getConnection()
        .then(conn => {
            conn.query('SELECT * FROM games')
                .then(results => {
                    conn.release();
                    res.render('17games', { results, message: 'SUCCESS' });
                })
                .catch(err => {
                    conn.release();
                    console.error('查詢失敗', err);
                });
        })
        .catch(err => {
            console.error('連線失敗', err);
        });
});
app.post('/games', (req, res) => {    // 比賽資料處理(管理者)
    var { insert, update, cut, playerid, game, hit, slugging, batting, era, bureau, whip } = req.body;
    if (insert) {
        pool.getConnection()
            .then(conn => {
                conn.query('INSERT INTO games (playersid, game, hit, slugging, batting, era, bureau, whip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [playerid, game, hit, slugging, batting, era, bureau, whip])
                    .then(() => {
                        conn.release();
                        res.redirect('/17games');
                    })
                    .catch(err => {
                        conn.release();
                        console.error('新增失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    } else if (cut) {
        pool.getConnection()
            .then(conn => {
                conn.query('DELETE FROM games WHERE playersid = ?', [playerid])
                    .then(() => {
                        conn.release();
                        res.redirect('/17games');
                    })
                    .catch(err => {
                        conn.release();
                        console.error('刪除失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    } else if (update) {
        pool.getConnection()
            .then(conn => {
                conn.query('UPDATE games SET game = ? , hit = ? , slugging = ? , batting = ? , era = ? , bureau = ? , whip = ?  WHERE playersid = ?', [game, hit, slugging, batting, era, bureau, whip, playerid])
                    .then(() => {
                        conn.release();
                        res.redirect('/17games');
                    })
                    .catch(err => {
                        conn.release();
                        console.error('更新失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    }
});
app.get('/17sql', OK, (req, res) => {    // 賽程資料(管理者)
    pool.getConnection()
        .then(conn => {
            conn.query('SELECT * FROM taiwan')
                .then(results => {
                    conn.release();
                    res.render('17sql', { results, message: 'SUCCESS' });
                })
                .catch(err => {
                    conn.release();
                    console.error('查詢失敗', err);
                });
        })
        .catch(err => {
            console.error('連線失敗', err);
        });
});
app.post('/db', (req, res) => {    // 賽程資料處理(管理者)
    var { insert, update, cut, years, noone, notwo, gone, gtwo, gthree, gfour, gfive, gsix, gseven } = req.body;
    if (insert) {
        pool.getConnection()
            .then(conn => {
                conn.query('INSERT INTO taiwan (years, noone, notwo, gone, gtwo, gthree, gfour, gfive, gsix, gseven) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [years, noone, notwo, gone, gtwo, gthree, gfour, gfive, gsix, gseven])
                    .then(() => {
                        conn.release();
                        res.redirect('/17sql');
                    })
                    .catch(err => {
                        conn.release();
                        console.error('新增失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    } else if (cut) {
        pool.getConnection()
            .then(conn => {
                conn.query('DELETE FROM taiwan WHERE years = ?', [years])
                    .then(() => {
                        conn.release();
                        res.redirect('/17sql');
                    })
                    .catch(err => {
                        conn.release();
                        console.error('刪除失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    } else if (update) {
        pool.getConnection()
            .then(conn => {
                conn.query('UPDATE taiwan SET noone = ? , notwo = ? , gone = ? , gtwo = ? , gthree = ? , gfour = ? , gfive = ? , gsix = ? , gseven = ?  WHERE years = ?', [noone, notwo, gone, gtwo, gthree, gfour, gfive, gsix, gseven, years])
                    .then(() => {
                        conn.release();
                        res.redirect('/17sql');
                    })
                    .catch(err => {
                        conn.release();
                        console.error('更新失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    }
});

app.get('/introduce', (req, res) => {    // 球團介紹(使用者)
    var query = req.query.query;
    var QUERY = req.query.QUERY;
    if (query === '味全龍') {
        pool.getConnection()
            .then(conn => {
                conn.query('SELECT number, name, field, habit, game, hit, slugging, batting, era, bureau, whip FROM games JOIN players ON games.playersid = players.playersid WHERE players.teamsid = 159')
                    .then(results => {
                        res.render('introduce', { query: query, results: results, message: '查詢成功' });
                        conn.release();
                    })
                    .catch(err => {
                        conn.release();
                        console.error('查詢失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    } else if (query === '富邦悍將') {
        pool.getConnection()
            .then(conn => {
                conn.query('SELECT number, name, field, habit, game, hit, slugging, batting, era, bureau, whip FROM games JOIN players ON games.playersid = players.playersid WHERE players.teamsid = 161')
                    .then(results => {
                        conn.release();
                        res.render('introduce', { query: query, results: results, message: '查詢成功' });
                    })
                    .catch(err => {
                        conn.release();
                        console.error('查詢失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    } else if (query === '樂天桃猿') {
        pool.getConnection()
            .then(conn => {
                conn.query('SELECT number, name, field, habit, game, hit, slugging, batting, era, bureau, whip FROM games JOIN players ON games.playersid = players.playersid WHERE players.teamsid = 157')
                    .then(results => {
                        conn.release();
                        res.render('introduce', { query: query, results: results, message: '查詢成功' });
                    })
                    .catch(err => {
                        conn.release();
                        console.error('查詢失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    } else if (query === '中信兄弟') {
        pool.getConnection()
            .then(conn => {
                conn.query('SELECT number, name, field, habit, game, hit, slugging, batting, era, bureau, whip FROM games JOIN players ON games.playersid = players.playersid WHERE players.teamsid = 158')
                    .then(results => {
                        conn.release();
                        res.render('introduce', { query: query, results: results, message: '查詢成功' });
                    })
                    .catch(err => {
                        conn.release();
                        console.error('查詢失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    } else if (query === '統一7-ELEVEn獅') {
        pool.getConnection()
            .then(conn => {
                conn.query('SELECT number, name, field, habit, game, hit, slugging, batting, era, bureau, whip FROM games JOIN players ON games.playersid = players.playersid WHERE players.teamsid = 160')
                    .then(results => {
                        conn.release();
                        res.render('introduce', { query: query, results: results, message: '查詢成功' });
                    })
                    .catch(err => {
                        conn.release();
                        console.error('查詢失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    } else if (QUERY) {
        pool.getConnection()
            .then(conn => {
                conn.query('SELECT number, name, field, habit, game, hit, slugging, batting, era, bureau, whip FROM games JOIN players ON games.playersid = players.playersid WHERE players.name = ?', [QUERY])
                    .then(results => {
                        conn.release();
                        res.render('introduce', { query: query, results: results, message: '查詢成功' });
                    })
                    .catch(err => {
                        conn.release();
                        console.error('查詢失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    } else {
        res.render('introduce', { query: null, results: null, message: '查無資料' });
    }
});
app.get('/introduceform', (req, res) => {    // 球團介紹
    pool.getConnection()
        .then(conn => {
            conn.query('SELECT * FROM teams WHERE year = 2022')
                .then(results => {
                    conn.release();
                    res.json({ results: results });
                })
                .catch(err => {
                    conn.release();
                    console.error('查詢失敗', err);
                });
        })
        .catch(err => {
            console.error('連線失敗', err);
        });
});
app.get('/winner', (req, res) => {    // 歷年戰績(使用者)
    var query = req.query.query;
    var QUERY = req.query.QUERY;
    if (query) {
        pool.getConnection()
            .then(conn => {
                conn.query('SELECT * FROM teams WHERE year = ?', [query])
                    .then(results => {
                        conn.release();
                        res.render('winner', { query: query, results: results, message: '查詢成功' });
                    })
                    .catch(err => {
                        conn.release();
                        console.error('查詢失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    } else if (QUERY) {
        pool.getConnection()
            .then(conn => {
                conn.query('SELECT * FROM teams WHERE who = ?', [QUERY])
                    .then(results => {
                        conn.release();
                        res.render('winner', { query: query, results: results, message: '查詢成功' });
                    })
                    .catch(err => {
                        conn.release();
                        console.error('查詢失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    } else {
        res.render('winner', { query: null, results: null, message: '查無資料' });
    }
});
app.get('/winnerform', (req, res) => {    // 歷年戰績
    pool.getConnection()
        .then(conn => {
            conn.query('SELECT DISTINCT year FROM teams')
                .then(results => {
                    conn.release();
                    res.json({ results: results });
                })
                .catch(err => {
                    conn.release();
                    console.error('查詢失敗', err);
                });
        })
        .catch(err => {
            console.error('連線失敗', err);
        });
});
app.get('/sql', (req, res) => {    // 經典查詢
    var QUERY = req.query.QUERY;
    var query = req.query.query;
    if ((QUERY < 2023 && QUERY > 1989) && (query < 2023 && query > 1989)) {
        pool.getConnection()
            .then(conn => {
                conn.query('SELECT * FROM taiwan WHERE years BETWEEN ? AND ?', [QUERY, query])
                    .then(results => {
                        conn.release();
                        res.render('sql', { results: results, message: '查詢成功' });
                    })
                    .catch(err => {
                        conn.release();
                        console.error('查詢失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    } else {
        res.render('sql', { results: null, message: '查無資料' });
    }
});
app.get('/champion', (req, res) => {    // 預測分析(使用者)
    var query = req.query.query;
    var QUERY = req.query.QUERY;

    if (query && QUERY) {
        pool.getConnection()
            .then(conn => {
                conn.query('SELECT total, win FROM teams WHERE year IN (2021,2022) AND who = ?', [query])
                    .then(results => {
                        conn.release();

                        var totalSum = results.reduce((sum, result) => sum + result.total, 0);    // 總比賽場次
                        var winSum = results.reduce((sum, result) => sum + result.win, 0);    // 總勝場數

                        var winRate = (winSum / totalSum).toFixed(3);
                        var lossRate = 1 - winRate;

                        function predictFutureWinRate(TeamA_Win_Rate, TeamB_Win_Rate, numFutureGames) {
                            TeamA_Win_Rate = Math.min(Math.max(TeamA_Win_Rate, 0), 1);
                            TeamB_Win_Rate = Math.min(Math.max(TeamB_Win_Rate, 0), 1);

                            for (var i = 0; i < numFutureGames; i++) {
                                var TeamA_Win_Probability = TeamA_Win_Rate / (TeamA_Win_Rate + TeamB_Win_Rate);
                                var TeamB_Win_Probability = 1 - TeamA_Win_Probability;

                                TeamA_Win_Rate += 0.01 * (Math.random() - 0.5);
                                TeamB_Win_Rate += 0.01 * (Math.random() - 0.5);

                                TeamA_Win_Rate = Math.min(Math.max(TeamA_Win_Rate, 0), 1);
                                TeamB_Win_Rate = Math.min(Math.max(TeamB_Win_Rate, 0), 1);
                            }

                            return {
                                TeamA_Win_Rate: TeamA_Win_Rate,
                                TeamB_Win_Rate: TeamB_Win_Rate
                            };
                        }

                        var numFutureGames = QUERY;
                        var futureWinRates = predictFutureWinRate(winRate, lossRate, numFutureGames);

                        res.render('champion', { query: query, QUERY: QUERY, futureWinRates: futureWinRates.TeamA_Win_Rate.toFixed(3), message: '查詢成功' });
                    })
                    .catch(err => {
                        conn.release();
                        console.error('查詢失敗', err);
                    });
            })
            .catch(err => {
                console.error('連線失敗', err);
            });
    } else {
        res.render('champion', { query: null, QUERY: null, futureWinRates: null, message: '查無資料' });
    }
});
app.get('/championform', (req, res) => {    // 預測分析
    pool.getConnection()
        .then(conn => {
            conn.query('SELECT * FROM teams WHERE year = 2022')
                .then(results => {
                    conn.release();
                    res.json({ results: results });
                })
                .catch(err => {
                    conn.release();
                    console.error('查詢失敗', err);
                });
        })
        .catch(err => {
            console.error('連線失敗', err);
        });
});

app.listen(3000, () => {    // 啟動主程式
    console.log(`http://127.0.0.1:3000/`);
});
