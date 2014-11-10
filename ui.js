// Joe Gillotti - 11/9/2014

/*
 * Control aspects of UI
 */

function Ui () {
  this.game = new Game();

  this.visibleDeckCard = -1;

  function getCardUnicode(card) {
    // http://en.wikipedia.org/wiki/Standard_52-card_deck#Text
    if (card.type == 'boxcover')
      return '&#x1F0A0';

    var numberProgressions = {
      ace:   '1',
      king:  'E',
      queen: 'D',
      jack:  'C',
      10:    'A',
    };

    for (var i = 2; i <= 9; i++) {
      numberProgressions[i] = i;
    }

    var suiteProgressions = {
      diamonds: 'C',
      hearts:   'B',
      spades:   'A',
      clubs:    'D',
    }
    
    return '&#x1F0'+ suiteProgressions[card.suite]+numberProgressions[card.type];
  }

  this.drawCard = function(card, depth, drag) {
    depth = depth || 0;
    drag = drag || false;
    var text = getCardUnicode(card);
    var div = $('<div>')
                .addClass(card.suite)
                .addClass('card')
                .html(text)
                .css('top', (depth*2) + 'px')
                .css('left', '0');
    
    if (drag) {
      div.draggable({
        containment: '#content',
        cursor: 'grab',
        revert: true,
        stack: '.card'
      });
      div.data('card', card)
    }

    return div;
  }

  this.redraw = function() {
  
    // Empty elements...
    for (var i = 1; i <= 4; i++) {
      $('#slot'+i).empty();
    }
    for (var i = 1; i <= 7; i++) {
      $('#stack'+i).empty();
    }


    // Put cards in stack on bottom..
    for (var i = 0; i < 7; i++) {
      var cards = this.game.stacks[i].cards;
      var stackwrapper = $('#stack'+(i+1));
      for (var j = 0; j < cards.length; j++) {
        stackwrapper.append(
          this.drawCard(cards[j], j, j == cards.length - 1)
            .data('source', 'stacks')
            .data('sourceindex', i)
            .data('cardindex', j)
        );
      }
    }

    // Put cards in slots on top
    for (var i = 0; i < 4; i++) {
      var cards = this.game.slots[i].cards;
      var slotwrapper = $('#slot'+(i+1));
      for (var j = 0; j < cards.length; j++) {
        slotwrapper.append(
          this.drawCard(cards[j], j, j == cards.length - 1)
            .data('source', 'slots')
            .data('sourceindex', i)
            .data('cardindex', j)
        );
      }
    }

    // Deal with deck thing
    $('#boxcover').append(this.drawCard({type: 'boxcover'}))

    $('#hand').empty()
    if (this.visibleDeckCard > -1 && this.visibleDeckCard < this.game.deck[0].cards.length) {
      $('#hand').append(
        this.drawCard(this.game.deck[0].cards[this.visibleDeckCard], 0, true)
          .data('source', 'deck')
          .data('sourceindex', 0)
          .data('cardindex', this.visibleDeckCard)
      );
    }

  }

  /*
   * When you click the deck card thing, show next available card
   */
  $('#boxcover').click(_.bind(function() {
    var next = this.visibleDeckCard + 1;
    if (next > -1 && next < this.game.deck[0].cards.length)
      this.visibleDeckCard = next;
    else {
      this.visibleDeckCard = -1;
      console.log('reverting')
    }
    this.redraw();
  }, this));

  /*
   * Handle dropping cards onto stacks and slots
   */

  var configDropHandle = (function(my, dest, j) {
    $('#'+dest+(j + 1)).droppable({
      accept: '.card',
      hoverClass: 'dropping',
      drop: function(e, ui) {

        var element = ui.draggable;
        var card = element.data('card');
        var source = element.data('source');
        var sourceIndex = element.data('sourceindex');
        var cardIndex = element.data('cardindex');

        if (my.game[dest+'s'][j].add(card)) {
          my.game[source][sourceIndex].cards.splice(cardIndex, 1);

          ui.draggable.draggable('option', 'revert', false);
          ui.draggable.draggable('disable');

          if (source == 'deck') {
            this.visibleDeckCard--;
          }

          my.redraw();
        }
        else {
          console.log('Invalid move.')
        }
      }
    })
  })

  // Slots at top
  for (var i = 0; i < 4; i++) {
    configDropHandle(this, 'slot', i);
  }

  // Stacks at bottom
  for (var i = 0; i < 7; i++) {
    configDropHandle(this, 'stack', i);
  }

  /*
   * Start game and redo everything
   */
  this.restart = function() {
    this.visibleDeckCard = -1;
    this.game.restart();
    this.redraw();
  }
}
