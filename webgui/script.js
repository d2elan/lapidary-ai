var background_colours = {
    'white': '#ffffff',
    'blue': '#bbbbff',
    'red': '#ffbbbb',
    'green': '#bbffbb',
    'black': '#aaaaaa',
    'gold': '#ffffbb',
};

var border_colours = {
    'white': 'lightgrey',
    'blue': 'blue',
    'red': 'red',
    'green': 'green',
    'black': 'black',
    'gold': 'gold',
};


// shuffle function from https://bost.ocks.org/mike/algorithms/#shuffling
function shuffle(array) {
    var n = array.length, t, i;
    while (n) {
        i = Math.random() * n-- | 0; // 0 ≤ i < n
        t = array[n];
        array[n] = array[i];
        array[i] = t;
    }
    return array;
}

class GemsList {
    constructor(gems) {
        if (gems instanceof GemsList) {
            gems = gems.gems;
        }
        this.gems = gems;

        for (var i = 0, size = colours.length; i < size; i++) {
            var colour = colours[i];
            if (!(colour in this.gems)) {
                this.gems[colour] = 0;
            }
        }
    }

    add(gemslist) {
        for (var i = 0, size = colours.length; i < size; i++) {
            var colour = colours[i];
            this.gems[colour] += gemslist.gems[colour];
        }
    }
}



var test_state = new GameState();


Vue.component('gems-table', {
    props: ['gems', 'cards', 'show_card_count'],
    template: `
<table class="gems-table">
  <tr>
    <gems-table-gem-counter v-for="(number, colour) in gems"
        v-bind:key="colour"
        v-bind:colour="colour"
        v-bind:number="number">
    </gems-table-gem-counter>
  </tr>
  <tr v-if="show_card_count">
    <gems-table-card-counter v-for="(number, colour) in gems"
        v-bind:key="colour"
        v-bind:colour="colour"
        v-bind:number="number">
    </gems-table-card-counter>
  </tr>
</table>
`
});

Vue.component('gems-table-gem-counter', {
    props: ['colour', 'number'],
    computed: {
        border_colour: function() {
            return border_colours[this.colour];
        },
        background_colour: function() {
            return background_colours[this.colour];
        }
    },
    template: `
<td class="gems-table-gem-counter"
    v-bind:style="{background: background_colour, borderColor: border_colour}">
  {{ number }}
</td>
`
});

Vue.component('gems-table-card-counter', {
    props: ['colour', 'number'],
    computed: {
        border_colour: function() {
            return border_colours[this.colour];
        },
        background_colour: function() {
            return background_colours[this.colour];
        }
    },
    template: `
<td class="gems-table-card-counter"
    v-bind:style="{background: background_colour, borderColor: border_colour}">
  {{ number }}
</td>
`
});


Vue.component('gems-list', {
    props: {gems: {},
            title: "",
            display_zeros: {default: true}},
    template: `
<div class="gems-list">
    <h3 v-if="title">{{ title }}</h3>
    <ul>
    <gem-counter 
        v-for="(number, colour) in gems"
        v-bind:key="colour"
        v-bind:colour="colour"
        v-bind:number="number"
        v-if="number > 0 || display_zeros">
    </gem-counter>
    </ul>
</div>`
});

Vue.component('gem-counter', {
    props: ['colour', 'number'],
    computed: {
        border_colour: function() {
            return border_colours[this.colour];
        },
        background_colour: function() {
            return background_colours[this.colour];
        }
    },
    template: `
<li class="gem-counter" 
    v-bind:style="{background: background_colour, borderColor: border_colour}">
  {{ number }}
</li>
`
});

Vue.component('gem-discarder', {
    props: ['player', 'gems'],
    template: `
<div class="gem-discarder">
  <h3>discard gems</h3>
  <gem-discarder-table v-bind:gems="gems"
                       v-bind:player_gems="player.gems">
  </gem-discarder-table>
  <button v-on:click="discard_gems()">
discard gems
  </button>
</div>
`
});

Vue.component('gem-discarder-table', {
    props: ['gems', 'player_gems'],
    template: `
<table class="gem-selector">
  <tr>
    <gems-table-gem-counter v-for="(number, colour) in player_gems"
        v-bind:key="colour"
        v-bind:colour="colour"
        v-bind:number="number">
    </gems-table-gem-counter>
  </tr>
  <tr>
    <increment-button v-for="(number, colour) in gems"
                      v-bind:key="colour"
                      v-on:increment="gems[$event] += 1"
                      v-bind:colour="colour">
    </increment-button>
  </tr>
  <tr>
    <decrement-button v-for="(number, colour) in gems"
                      v-bind:key="colour"
                      v-on:decrement="gems[$event] -= 1"
                      v-bind:colour="colour">
    </decrement-button>
  </tr>
</table>
`
});

Vue.component('move-maker', {
    props: ['player', 'supply_gems', 'gems'],
    // data: function() {
    //     return {
    //         gems: {white: 0,
    //                blue: 0,
    //                green: 0,
    //                red: 0,
    //                black: 0,
    //                gold: 0},
    //     };
    // },
    methods: {
        take_gems: function() {
            for (var i = 0; i < colours.length; i++) {
                var colour = colours[i];
                this.player.gems[colour] += this.gems[colour];
                this.supply_gems[colour] -= this.gems[colour];
                this.gems[colour] = 0;
            }
        }
    },
    template: `
<div class="move-maker">
  <h3>take gems</h3>
  <gem-selector v-bind:supply_gems="supply_gems"
                v-bind:gems="gems">
  </gem-selector>
  <button v-on:click="take_gems()">
    take gems
  </button>
</div>
`
});

Vue.component('gem-selector', {
    props: ['supply_gems', 'gems'],
    computed: {
        can_increment: function() {
            var any_value_2 = false;
            var num_values_1 = 0;
            for (var i = 0; i < colours.length; i++) {
                var colour = colours[i];
                if (this.gems[colour] >= 2) {
                    any_value_2 = true;
                }
                if (this.gems[colour] == 1) {
                    num_values_1 += 1;
                }
            }
            var incrementable = {};
            for (var i = 0; i < colours.length; i++) {
                var colour = colours[i];
                incrementable[colour] = !any_value_2 && (
                    (num_values_1 == 1 && this.gems[colour] == 1 && this.supply_gems[colour] > 3) || 
                        ((num_values_1 < 3) && this.supply_gems[colour] > 0 && this.gems[colour] == 0));
            }
            return incrementable;
        },
        can_decrement: function() {
            var decrementable = {};
            for (var i = 0; i < colours.length; i++) {
                var colour = colours[i];
                decrementable[colour] = (this.gems[colour] > 0);
            }
            return decrementable;
        }
    },
    template: `
<table class="gem-selector">
  <tr>
    <gems-table-gem-counter v-for="(number, colour) in gems"
        v-bind:key="colour"
        v-bind:colour="colour"
        v-bind:number="number">
    </gems-table-gem-counter>
  </tr>
  <tr>
    <increment-button v-for="(number, colour) in gems"
                      v-bind:key="colour"
                      v-bind:enabled="can_increment[colour]"
                      v-on:increment="gems[$event] += 1"
                      v-bind:colour="colour">
    </increment-button>
  </tr>
  <tr>
    <decrement-button v-for="(number, colour) in gems"
                      v-bind:key="colour"
                      v-bind:enabled="can_decrement[colour]"
                      v-on:decrement="gems[$event] -= 1"
                      v-bind:colour="colour">
    </decrement-button>
  </tr>
</table>
`
});

Vue.component('increment-button', {
    props: ['colour', 'enabled'],
    template: `
<td class="increment-button">
  <button v-bind:disabled="!enabled"
          v-on:click="$emit('increment', colour)">
    +
  </button>
</td>
`
});

Vue.component('decrement-button', {
    props: ['colour', 'enabled'],
    template: `
<td class="decrement-button">
  <button v-bind:disabled="!enabled"
          v-on:click="$emit('decrement', colour)">
    -
  </button>
</td>
`
});

Vue.component('player-display', {
    props: ['player'],
    computed: {
        player_num_gems: function() {
            return (this.player.gems['white'] +
                    this.player.gems['blue'] +
                    this.player.gems['green'] +
                    this.player.gems['red'] +
                    this.player.gems['black'] +
                    this.player.gems['gold']);
        }
    },
    template: `
<div class="player-display">
<h3>Player {{ player.number }}: {{ player.score }} points, {{ player_num_gems }} gems</h3>
    <gems-table v-bind:gems="player.gems"
                v-bind:show_card_count="true"
                v-bind:cards="player.card_colours">
    </gems-table>
    <cards-display v-bind:cards="player.cards_in_hand"
                   v-bind:player="player"
                   tier="hand"
                   v-bind:show_reserve_button="false">
    </cards-display>
</div>
`
})

Vue.component('cards-display', {
    props: ['cards', 'name', 'tier', 'player', 'show_reserve_button'],
    methods: {
        reserve: function(card) {
            var card_index;
            for (var i = 0; i < this.cards.length; i++) {
                if (this.cards[i] === card) {
                    card_index = i;
                }
            }
            this.$emit('reserve', [this.tier, card_index]);
        }
    },
    template: `
<div class="cards-display">
    <h3>{{ name }}</h3>
    <ul class="single-line-list">
      <card-display
          v-for="card in cards"
          v-bind:show_reserve_button="show_reserve_button"
          v-bind:player="player"
          v-bind:key="card.id"
          v-bind:card="card" 
          v-on:reserve="reserve($event)">
      </card-display>
    </ul>
</div>
`
})

Vue.component('card-display', {
    props: ['card', 'player', 'show_reserve_button'],
    computed: {
        background_colour: function() {
            return background_colours[this.card.colour];
        },
        buyable: function() {
            return this.player.can_afford(this.card)[0];
        },
        reservable: function() {
            return (this.player.cards_in_hand.length < 3);
        }
    },
    template: `
<li class="card-display">
<div class="card-display-contents" v-bind:style="{background: background_colour}">
    <p class='card-points'>{{ card.points }}</p>
    <button v-if="show_reserve_button"
            v-bind:disabled="!reservable"
            v-on:click="$emit('reserve', card)">
        reserve
    </button>
    <button v-bind:disabled="!buyable">
        buy
    </button>
    <gems-list v-bind:gems="card.gems" 
               v-bind:display_zeros="false">
    </gems-list>
</div>
</li>
`
})

var app = new Vue({
    el: '#app',
    data: {
        state: test_state,
        human_player_index: 0,
        mode: 'human turn',
        gems_selected: {'white': 0,
                        'blue': 0,
                        'green': 0,
                        'red': 0,
                        'black': 0,
                        'gold': 0},
        gems_discarded: {'white': 0,
                         'blue': 0,
                         'green': 0,
                         'red': 0,
                         'black': 0,
                         'gold': 0}
    },
    methods: {
        testChangeGems: function() {
            this.state.reduce_gems();
        },
        test_change_mode: function() {
            if (this.mode === 'human turn') {
                this.mode = 'ai turn';
            } else {
                this.mode = 'human turn';
            }

            for (var i = 0; i < colours.length; i++) {
                this.gems_selected[colours[i]] = 0;
            }
        },
        reset: function() {
            this.state = new GameState();
        } ,
        do_move_reserve: function(info) {
            this.state.make_move({action: 'reserve',
                                  tier: info[0],
                                  index: info[1],
                                  gems: {}});
        }
    },
    computed: {
        human_player: function() {
            return this.state.players[0];
        },
        round_number: function() {
            return this.state.round_number;
        },
        supply_gems: function() {
            return this.state.supply_gems;
        },
        players: function() {
            return this.state.players;
        }
    }
});

