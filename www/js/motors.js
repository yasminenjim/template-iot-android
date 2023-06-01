function motorgo(lr, speed) {
    var o;
    if (lr == 0) {
      o = { do: { ml: { s: speed } } };
    } else {
      o = { do: { mr: { s: speed } } };
    }
    fble.sendjson(o);
  }

  function motorstop(lr) {
    var o;
    if (lr == 0) {
      o = { do: { ml: { s: 0 } } };
    } else {
      o = { do: { mr: { s: 0 } } };
    }
    fble.sendjson(o);
  }