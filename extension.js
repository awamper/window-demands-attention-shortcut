const Lang = imports.lang;
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const Meta = imports.gi.Meta;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const Utils = Me.imports.utils;
const PrefsKeys = Me.imports.prefs_keys;

const CONNECTION_IDS = {
    WDA: 0
};

const WindowDemandsAttentionShortcut = new Lang.Class({
    Name: 'WindowDemandsAttentionShortcut',

    _init: function() {
        this._windows = [];

        CONNECTION_IDS.WDA = global.display.connect(
            'window-demands-attention',
            Lang.bind(this, this._on_window_demands_attention)
        );
    },

    _on_window_demands_attention: function(display, window) {
        this._windows.push(window);
    },

    _activate_last_window: function() {
        if(this._windows.length === 0) {
            Main.notify('No windows in the queue.');
            return;
        }

        let last_window = this._windows.pop();
        Main.activateWindow(last_window);
    },

    _add_keybindings: function() {
        Main.wm.addKeybinding(
            PrefsKeys.SHORTCUT,
            Utils.SETTINGS,
            Meta.KeyBindingFlags.NONE,
            Shell.KeyBindingMode.NORMAL |
            Shell.KeyBindingMode.MESSAGE_TRAY |
            Shell.KeyBindingMode.OVERVIEW,
            Lang.bind(this, this._activate_last_window)
        );
    },

    _remove_keybindings: function() {
        Main.wm.removeKeybinding(PrefsKeys.SHORTCUT);
    },

    enable: function() {
        this._add_keybindings();
    },

    disable: function() {
        global.display.disconnect(CONNECTION_IDS.WDA);
        CONNECTION_IDS.WDA = 0;

        this._remove_keybindings();
        this._windows = null;
    }
});

let wda_shortcut = null;

function init() {
    // nothing
}

function enable() {
    wda_shortcut = new WindowDemandsAttentionShortcut();
    wda_shortcut.enable();
}

function disable() {
    if(wda_shortcut !== null) {
        wda_shortcut.disable();
        wda_shortcut = null;
    }
}
