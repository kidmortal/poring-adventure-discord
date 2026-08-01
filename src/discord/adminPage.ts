/**
 * The command management page, served at `GET /discord`.
 *
 * Embedded as a string rather than a static asset so it needs no extra
 * dependency and no `nest-cli.json` asset copying — it survives `nest build`
 * like any other module.
 *
 * The page itself is unauthenticated and holds no secrets: the admin token is
 * typed in by whoever opens it and travels with each request to the guarded
 * routes below.
 */
export const ADMIN_PAGE_HTML = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Poring Adventure — Discord commands</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #f6f7f9;
    --panel: #ffffff;
    --border: #d9dee5;
    --text: #1b1f24;
    --muted: #5c6673;
    --accent: #5865f2;
    --danger: #d83c3e;
    --ok: #2d9c5a;
    --code: #eef0f4;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #16181d;
      --panel: #1e2127;
      --border: #333944;
      --text: #e6e9ef;
      --muted: #98a1b0;
      --code: #262a32;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 2rem 1rem;
    font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background: var(--bg); color: var(--text);
  }
  main { max-width: 60rem; margin: 0 auto; }
  h1 { font-size: 1.4rem; margin: 0 0 .25rem; }
  .sub { color: var(--muted); margin: 0 0 1.5rem; }
  .panel {
    background: var(--panel); border: 1px solid var(--border);
    border-radius: 10px; padding: 1.25rem; margin-bottom: 1.25rem;
  }
  .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
  label { display: block; font-weight: 600; font-size: .82rem; margin-bottom: .35rem; }
  input[type=text], input[type=password] {
    width: 100%; padding: .55rem .7rem; border-radius: 7px;
    border: 1px solid var(--border); background: var(--bg); color: var(--text); font: inherit;
  }
  input:disabled { opacity: .5; }
  .hint { color: var(--muted); font-size: .78rem; margin-top: .35rem; }
  .check { display: flex; align-items: center; gap: .5rem; margin-top: 1.9rem; }
  .check label { margin: 0; }
  .actions { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 1.25rem; }
  button {
    padding: .55rem 1rem; border-radius: 7px; border: 1px solid var(--border);
    background: var(--panel); color: var(--text); font: inherit; font-weight: 600; cursor: pointer;
  }
  button:hover:not(:disabled) { border-color: var(--accent); }
  button:disabled { opacity: .5; cursor: progress; }
  button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
  button.danger { color: var(--danger); }
  #status { margin-top: 1rem; padding: .7rem .9rem; border-radius: 7px; display: none; white-space: pre-wrap; }
  #status.show { display: block; }
  #status.ok { background: color-mix(in srgb, var(--ok) 14%, transparent); border: 1px solid var(--ok); }
  #status.err { background: color-mix(in srgb, var(--danger) 14%, transparent); border: 1px solid var(--danger); }
  .cmd { border-top: 1px solid var(--border); padding: .85rem 0; }
  .cmd:first-of-type { border-top: 0; }
  .cmd-head { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }
  code {
    background: var(--code); padding: .1rem .4rem; border-radius: 5px;
    font: 13px ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .tag {
    font-size: .7rem; font-weight: 700; text-transform: uppercase;
    padding: .12rem .45rem; border-radius: 4px; border: 1px solid var(--border); color: var(--muted);
  }
  .tag.admin { color: var(--danger); border-color: var(--danger); }
  .desc { color: var(--muted); margin: .3rem 0 0; }
  .opts { margin: .45rem 0 0; padding-left: 1.1rem; color: var(--muted); font-size: .85rem; }
  .count { color: var(--muted); font-size: .85rem; font-weight: 400; }
  .empty { color: var(--muted); }
</style>
</head>
<body>
<main>
  <h1>Discord command deployment</h1>
  <p class="sub">Review what the bot will register, then push it to a guild or globally.</p>

  <section class="panel">
    <div class="grid">
      <div>
        <label for="token">Admin token</label>
        <input id="token" type="password" placeholder="ADMIN_TOKEN" autocomplete="off" />
        <p class="hint">From the bot's environment. Kept in this tab only.</p>
      </div>
      <div>
        <label for="guild">Guild id</label>
        <input id="guild" type="text" placeholder="Defaults to DISCORD_GUILD_ID" inputmode="numeric" />
        <p class="hint">Guild deploys apply instantly.</p>
      </div>
      <div class="check">
        <input id="global" type="checkbox" />
        <label for="global">Deploy globally</label>
      </div>
    </div>

    <div class="actions">
      <button id="preview" class="primary">Preview commands</button>
      <button id="deploy">Deploy</button>
      <button id="remove" class="danger">Remove all</button>
    </div>

    <div id="status"></div>
  </section>

  <section class="panel">
    <h2 style="font-size:1rem;margin:0 0 .75rem">Commands <span id="count" class="count"></span></h2>
    <div id="list"><p class="empty">Nothing loaded yet — hit “Preview commands”.</p></div>
  </section>
</main>

<script>
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var buttons = ['preview', 'deploy', 'remove'];

  // Convenience only; the token never leaves this tab except as a request header.
  try {
    var saved = sessionStorage.getItem('poring_admin_token');
    if (saved) $('token').value = saved;
  } catch (e) {}

  $('global').addEventListener('change', function () {
    $('guild').disabled = this.checked;
  });

  function setBusy(busy) {
    buttons.forEach(function (id) { $(id).disabled = busy; });
  }

  function say(message, ok) {
    var el = $('status');
    el.textContent = message;
    el.className = 'show ' + (ok ? 'ok' : 'err');
  }

  function query() {
    var params = new URLSearchParams();
    if ($('global').checked) {
      params.set('global', 'true');
    } else if ($('guild').value.trim()) {
      params.set('guildId', $('guild').value.trim());
    }
    return params.toString() ? '?' + params.toString() : '';
  }

  function request(method) {
    var token = $('token').value.trim();
    if (!token) {
      say('Enter the admin token first.', false);
      return Promise.reject(new Error('no token'));
    }
    try { sessionStorage.setItem('poring_admin_token', token); } catch (e) {}

    setBusy(true);
    return fetch('/discord/commands' + query(), {
      method: method,
      headers: { 'x-admin-token': token },
    })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (body) {
          if (!response.ok) {
            throw new Error(body.message || response.status + ' ' + response.statusText);
          }
          return body;
        });
      })
      .catch(function (error) {
        say(error.message, false);
        throw error;
      })
      .finally(function () { setBusy(false); });
  }

  function scopeLabel(result) {
    return result.scope === 'global' ? 'globally' : 'to guild ' + result.guildId;
  }

  function render(commands) {
    var list = $('list');
    $('count').textContent = commands.length ? '(' + commands.length + ')' : '';
    list.textContent = '';

    if (!commands.length) {
      var empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'No commands defined.';
      list.appendChild(empty);
      return;
    }

    commands.forEach(function (command) {
      var wrap = document.createElement('div');
      wrap.className = 'cmd';

      var head = document.createElement('div');
      head.className = 'cmd-head';

      var name = document.createElement('code');
      name.textContent = command.type === 'slash' ? '/' + command.name : command.name;
      head.appendChild(name);

      head.appendChild(tag(command.type));
      if (command.defaultMemberPermissions === '0') head.appendChild(tag('admins only', 'admin'));
      if (command.dmPermission === false) head.appendChild(tag('no DMs'));
      wrap.appendChild(head);

      if (command.description) {
        var desc = document.createElement('p');
        desc.className = 'desc';
        desc.textContent = command.description;
        wrap.appendChild(desc);
      }

      if (command.options && command.options.length) {
        var opts = document.createElement('ul');
        opts.className = 'opts';
        command.options.forEach(function (option) {
          var li = document.createElement('li');
          li.textContent = option.name + (option.required ? ' (required)' : ' (optional)') + ' — ' + option.description;
          opts.appendChild(li);
        });
        wrap.appendChild(opts);
      }

      list.appendChild(wrap);
    });
  }

  function tag(text, extra) {
    var el = document.createElement('span');
    el.className = 'tag' + (extra ? ' ' + extra : '');
    el.textContent = text;
    return el;
  }

  $('preview').addEventListener('click', function () {
    request('GET').then(function (result) {
      render(result.commands || []);
      say('Loaded ' + result.count + ' commands. Nothing has been deployed yet.', true);
    }).catch(function () {});
  });

  $('deploy').addEventListener('click', function () {
    request('POST').then(function (result) {
      render(result.commands || []);
      say('Deployed ' + result.count + ' commands ' + scopeLabel(result) +
        (result.scope === 'global' ? '. Global deploys can take up to an hour to appear.' : '.'), true);
    }).catch(function () {});
  });

  $('remove').addEventListener('click', function () {
    var where = $('global').checked ? 'globally' : 'from guild ' + ($('guild').value.trim() || 'DISCORD_GUILD_ID');
    if (!confirm('Remove every command ' + where + '?')) return;

    request('DELETE').then(function (result) {
      render([]);
      say('Removed every command ' + scopeLabel(result) + '.', true);
    }).catch(function () {});
  });
})();
</script>
</body>
</html>`;
