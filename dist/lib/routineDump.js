"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("./helper");
function routineDump(sqlFilesPath, db) {
    async function getRoutine(routineType) {
        let routineList;
        const res = await db.query(`SHOW ${routineType.toUpperCase()} STATUS;`);
        if (Array.isArray(res[0])) {
            routineList = res[0].map((el) => ({ db: el.Db, name: el.Name, type: el.Type }));
        }
        return routineList;
    }
    async function getAllRoutine() {
        const res = await Promise.all([getRoutine('PROCEDURE'), getRoutine('FUNCTION')]);
        return res.reduce((acc, el) => acc.concat(el), []);
    }
    async function saveAllRoutines() {
        let routines = await getAllRoutine();
        await Promise.allSettled(routines.map(async (routine) => {
            const res = await db.query(`SHOW CREATE ${routine.type} ${routine.db}.${routine.name};`);
            if (res[0] && res[0][0] && (res[0][0]['Create Function'] || res[0][0]['Create Procedure'])) {
                let createText = res[0][0]['Create Function'] ? res[0][0]['Create Function'] : res[0][0]['Create Procedure'];
                await helper_1.saveToFile(sqlFilesPath, `${routine.db}/${routine.type}`, `${routine.name}.sql`, createText);
                console.log(`Save ${routine.type} ${routine.db}.${routine.name}`);
            }
            return true;
        }));
    }
    return { saveAllRoutines };
}
exports.default = routineDump;
//# sourceMappingURL=routineDump.js.map