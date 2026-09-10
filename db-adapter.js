// db-adapter.js
// A tiny Firestore-shaped wrapper over the Supabase JS client, so app.js
// can use db.doc()/db.collection() exactly like it did with the Claude
// Artifact `db` capability. Keeps app.js nearly untouched.
//
// Supported surface (only what app.js actually calls):
//   db.doc(path).get()/.set(obj)/.update(obj)/.delete()/.onSnapshot(cb)
//   db.collection(path).orderBy(f,dir).where(f,'==',v).limit(n)
//     .add(obj) / .doc(id) / .onSnapshot(cb)
"use strict";

function createDocStore(sb) {
  function rowToData(row) {
    var d = Object.assign({}, row);
    delete d.id;
    return d;
  }

  function docRef(table, id) {
    return {
      id: id,
      get: function () {
        return sb.from(table).select("*").eq("id", id).maybeSingle().then(function (res) {
          if (res.error) throw res.error;
          var row = res.data;
          return { exists: !!row, data: function () { return row ? rowToData(row) : undefined; } };
        });
      },
      set: function (obj) {
        var row = Object.assign({}, obj, { id: id });
        return sb.from(table).upsert(row).then(function (res) { if (res.error) throw res.error; });
      },
      update: function (obj) {
        return sb.from(table).update(obj).eq("id", id).then(function (res) { if (res.error) throw res.error; });
      },
      delete: function () {
        return sb.from(table).delete().eq("id", id).then(function (res) { if (res.error) throw res.error; });
      },
      onSnapshot: function (next, onError) {
        var stopped = false;
        function load() {
          sb.from(table).select("*").eq("id", id).maybeSingle().then(function (res) {
            if (stopped) return;
            if (res.error) { onError && onError(res.error); return; }
            var row = res.data;
            next({ exists: !!row, data: function () { return row ? rowToData(row) : undefined; } });
          });
        }
        load();
        var channel = sb.channel("doc:" + table + ":" + id)
          .on("postgres_changes", { event: "*", schema: "public", table: table, filter: "id=eq." + id }, load)
          .subscribe();
        return function () { stopped = true; sb.removeChannel(channel); };
      }
    };
  }

  function collectionRef(table, opts) {
    opts = opts || {};
    function withOpt(k, v) {
      var o = Object.assign({}, opts);
      o[k] = v;
      return collectionRef(table, o);
    }
    function runQuery() {
      var q = sb.from(table).select("*");
      (opts.where || []).forEach(function (w) {
        var op = w.op === "==" ? "eq" : w.op;
        q = q[op](w.field, w.val);
      });
      if (opts.orderBy) q = q.order(opts.orderBy.field, { ascending: opts.orderBy.dir !== "desc" });
      if (opts.limit) q = q.limit(opts.limit);
      return q.then(function (res) { if (res.error) throw res.error; return res.data || []; });
    }
    function toSnapshot(rows) {
      return { docs: rows.map(function (row) { return { id: row.id, exists: true, data: function () { return rowToData(row); } }; }) };
    }
    return {
      orderBy: function (field, dir) { return withOpt("orderBy", { field: field, dir: dir || "asc" }); },
      where: function (field, op, val) {
        var list = (opts.where || []).slice();
        list.push({ field: field, op: op, val: val });
        return withOpt("where", list);
      },
      limit: function (n) { return withOpt("limit", n); },
      doc: function (id) { return docRef(table, id || crypto.randomUUID()); },
      add: function (obj) {
        var id = crypto.randomUUID();
        var row = Object.assign({}, obj, { id: id });
        return sb.from(table).insert(row).then(function (res) {
          if (res.error) throw res.error;
          return docRef(table, id);
        });
      },
      get: function () { return runQuery().then(toSnapshot); },
      onSnapshot: function (next, onError) {
        var stopped = false;
        function load() {
          runQuery().then(function (rows) { if (!stopped) next(toSnapshot(rows)); })
            .catch(function (err) { if (!stopped) onError && onError(err); });
        }
        load();
        var channel = sb.channel("col:" + table + ":" + JSON.stringify(opts))
          .on("postgres_changes", { event: "*", schema: "public", table: table }, load)
          .subscribe();
        return function () { stopped = true; sb.removeChannel(channel); };
      }
    };
  }

  return {
    doc: function (path) {
      var parts = path.split("/");
      return docRef(parts[0], parts[1]);
    },
    collection: function (path) { return collectionRef(path); }
  };
}

window.createDocStore = createDocStore;
