"use strict";

var sql = require("mssql");
var dbConfig = {
	server: "172.16.241.26\\MSSQLSERVER",
	//server: "172.17.244.46\\MSSQLSERVER",
	database: "RemoteControl_Dis",
	user: "sa",
	password: "Qwe`123",
	port: 1433,
	pool: {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000
	}
};
var connection = new sql.Connection(dbConfig); //cp = connection pool
//instantiate a connection pool
connection.connect(function (err) {
	if (err) {
		console.log(err);
		return;
	}
	console.log("connection OK");
	//conn.close();
});

//----------------------------------------------------------------------------------------------------------------------
// Конструктор - экспортируемая функция.
//----------------------------------------------------------------------------------------------------------------------
function internalMonitoringData() {
}

//----------------------------------------------------------------------------------------------------------------------
// Получение идентификатора для URL.
//----------------------------------------------------------------------------------------------------------------------
function getURL_ID(request, url) {
	return new Promise(function(resolve, reject) {
		request.query("SELECT ID FROM Addresses WHERE URL = '" + url + "'", function (err, recordset) {
			if (err) {
				reject(Error(err));
			}
			console.log("В выборке из таблицы Addresses " + recordset.length + " записей");
			if (recordset.length == 0) {
				console.log("Добавление новой записи в таблицу Addresses");
				request.query("INSERT INTO Addresses (URL) VALUES ('" + url + "')", function (err) {
					if (err) {
						reject(Error(err));
					}
					request.query("SELECT ID FROM Addresses WHERE URL = '" + url + "'", function (err, recordset) {
						if (err) {
							reject(Error(err));
						}
						console.log("В выборке из таблицы Addresses " + recordset.length + " записей");
						if (recordset.length == 0) {
							reject("Ошибка добавления URL " + url);
						}
						else {
							resolve(recordset[0].ID);
						}
					});
				});
			}
			else {
				resolve(recordset[0].ID);
			}
		});
	});
}

//----------------------------------------------------------------------------------------------------------------------
// Получение идентификатора для кода HTTP-статуса.
//----------------------------------------------------------------------------------------------------------------------
function getHTTP_Status_ID(request, statusCode) {
	return new Promise(function(resolve, reject) {
		request.query("SELECT ID FROM HTTPStatusCodes WHERE Code = '" + statusCode + "'", function (err, recordset) {
			if (err) {
				reject(Error(err));
			}
			console.log("В выборке из таблицы HTTPStatusCodes " + recordset.length + " записей");
			if (recordset.length == 0) {
				console.log("Добавление новой записи в таблицу HTTPStatusCodes");
				request.query("INSERT INTO HTTPStatusCodes (Code) VALUES ('" + statusCode + "')", function (err) {
					if (err) {
						reject(Error(err));
					}
					request.query("SELECT ID FROM HTTPStatusCodes WHERE Code = '" + statusCode + "'", function (err, recordset) {
						if (err) {
							reject(Error(err));
						}
						console.log("В выборке из таблицы HTTPStatusCodes " + recordset.length + " записей");
						if (recordset.length == 0) {
							reject(Error("Ошибка добавления кода HTTP-статуса " + statusCode));
						}
						else {
							resolve(recordset[0].ID);
						}
					});
				});
			}
			else {
				resolve(recordset[0].ID);
			}
		});
	});
}

//----------------------------------------------------------------------------------------------------------------------
// Получение идентификатора для текста ошибки.
//----------------------------------------------------------------------------------------------------------------------
function getErrorTexts_ID(request, errorText) {
	return new Promise(function(resolve, reject) {
		// Если текста ошибки нет, то связь с таблиценй не нужна.
		if (errorText === "") {
			resolve(null);
			return;
		}

		// Поиск нужного идентификатора.
		request.query("SELECT ID FROM ErrorTexts WHERE Error = '" + errorText + "'", function (err, recordset) {
			if (err) {
				reject(Error(err));
			}
			console.log("В выборке из таблицы ErrorTexts " + recordset.length + " записей");
			if (recordset.length == 0) {
				console.log("Добавление новой записи в таблицу ErrorTexts");
				request.query("INSERT INTO ErrorTexts (Error) VALUES ('" + errorText + "')", function (err) {
					if (err) {
						reject(Error(err));
					}
					request.query("SELECT ID FROM ErrorTexts WHERE Error = '" + errorText + "'", function (err, recordset) {
						if (err) {
							reject(Error(err));
						}
						console.log("В выборке из таблицы ErrorTexts " + recordset.length + " записей");
						if (recordset.length == 0) {
							reject(Error("Ошибка добавления текста ошибки '" + errorText + "'"));
						}
						else {
							resolve(recordset[0].ID);
						}
					});
				});
			}
			else {
				resolve(recordset[0].ID);
			}
		});
	});
}

//----------------------------------------------------------------------------------------------------------------------
// Получение текущего среза данных мониторинга.
//----------------------------------------------------------------------------------------------------------------------
function getCurrentData(request, callback) {
	request.query(`
		DECLARE @StartTime AS DATETIME2 = '2016-03-31T08:45:00';
		SELECT 
			A.Name
			, S.Name AS Status
			, ErrorID
			, IMD_1.CheckTime
			, CAST (IMD_1.CheckDuration AS decimal(15, 0)) / 1000000000 AS CheckDuration
		FROM InternalMonitoringData AS IMD_1
		LEFT JOIN Addresses AS A ON IMD_1.AddressID = A.ID
		LEFT JOIN HTTPStatusCodes AS S ON IMD_1.StatusID = S.ID
		WHERE
		IMD_1.CheckTime > @StartTime
		AND IMD_1.CheckTime =
			(SELECT MAX(CheckTime) FROM InternalMonitoringData AS IMD_2 WHERE IMD_2.AddressID = IMD_1.AddressID)
		ORDER BY
			IMD_1.StatusID DESC
			, IMD_1.CheckDuration DESC
			, IMD_1.CheckTime DESC
		`)
		.then(function(recordset) {
			callback(null, recordset);
		})
		.catch(function(err) {
			console.log(err);
			callback(err);
		});
}

//----------------------------------------------------------------------------------------------------------------------
// Экспортируемый метод - добавление данных внутреннего мониторинга.
//----------------------------------------------------------------------------------------------------------------------
internalMonitoringData.prototype.add = function (checkTime, checkDuration, url, statusCode, errorText, callback) {
	"use strict";

	// Объект для обращения к СУБД.
	var request = new sql.Request(connection);

	// Ключи.
	var urlID = 0;
	var statusID = 0;
	var errorID = 0;

	// Поиск ключей.
	Promise.all([
		getURL_ID(request, url),
		getHTTP_Status_ID(request, statusCode),
		getErrorTexts_ID(request, errorText)
		])
		.then(values => {
			urlID = values[0];
			statusID = values[1];
			errorID = values[2];
			// Внесение данных в СУБД.
			request.query("INSERT INTO InternalMonitoringData (CheckTime, CheckDuration, AddressID, StatusID, ErrorID) VALUES ('"
				+ checkTime + "', "
				+ checkDuration + ", "
				+ urlID + ", "
				+ statusID + ", "
				+ errorID + ")"
				, function (err, recordset) {
				if (err) {
					console.log(err);
					callback(err);
				} else {
					console.log("OK");
					callback("OK");
				}
			});
		})
		.catch(function(error) {
			console.log(error);
			callback(error);
		});
};

//----------------------------------------------------------------------------------------------------------------------
// Экспортируемый метод - запрос текущего среза данных внутреннего мониторинга.
//----------------------------------------------------------------------------------------------------------------------
internalMonitoringData.prototype.get_current = function (callback) {
	"use strict";

	// Объект для обращения к СУБД.
	var request = new sql.Request(connection);

	// Запрос данных.
	getCurrentData(request, function (err, data) {
		if (err) {
			console.log(err);
			callback(err);
		} else {
			callback(data);
		}
	});
};

module.exports = internalMonitoringData;