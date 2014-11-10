// Joe Gillotti - 11/9/2014


/**
 * Combined state class... 
 */

function Game() {

  /**
   * Maintain card state and position in these arrays.
   */

  this.cards = [];
  this.deck = [];
  this.slots = [];
  this.stacks = []

  /*
   * Core classes
   */

  function Slot(type) {
    this.cards = [];
    this.type = type

    this.getLastCard = function() {
      return this.cards[this.cards.length - 1];
    }
  }

  // Add card up front
  Slot.prototype.add = function(card) {
    // If this is a top slot, allow if the card being 
    // added is greater than the last in our stack, starting
    // with Ace
    if (this.type == 'topslot') {
      if (this.cards.length == 0 && card.type == 'ace') {
        this.cards.push(card);
        return true;
      }
      if (this.cards.length > 0 && card.greaterThan(this.getLastCard()) && card.suite == this.getLastCard().suite) {
        this.cards.push(card);
        return true;
      }
    }

    // If this is a stack, allow if card being added is less
    // than last in our stack, starting with King. Also alternate
    // colors
    else if (this.type == 'stack') {
      if (this.cards.length == 0 && card.type == 'king') {
        this.cards.push(card);
        return true;
      }
      if (this.cards.length > 0 && card.lessThan(this.getLastCard()) && card.getColor() != this.getLastCard().getColor()) {
        this.cards.push(card);
        return true;
      }
    }

    return false;
  }

  function Card(suite, type) {
    this.suite = suite;
    this.type = type;

    this.getWeight = function() {
      var comparisons = {};
      var i = -1;
      comparisons['ace'] = ++i;
      for (var j = 2; j <= 10; j++) {
        comparisons[j] = ++i;
      }
      var types = ['jack', 'queen', 'king'];
      for (var type in types) {
        comparisons[types[type]] = ++i;
      }
      return comparisons[this.type];
    }
  }

  Card.prototype.greaterThan = function (othercard) {
    return this.getWeight() > othercard.getWeight() && this.getWeight() - othercard.getWeight() == 1;
  }

  Card.prototype.lessThan = function (othercard) {
    return this.getWeight() < othercard.getWeight() && othercard.getWeight() - this.getWeight() == 1;
  }

  Card.prototype.getColor = function() {
    return {
      'clubs': 'black',
      'spades': 'black',
      'diamonds': 'red',
      'hearts': 'red',
    }[this.suite];
  }


  /**
   * Convenience functions
   */

  // Check game over
  this.checkWin = function () {
    return true;
  }

  /**
   * Populate & start game:
   */
  this.restart = function() {
    this.cards = [];
    this.deck = [new Slot('deck')];
    this.slots = [];
    this.stacks = []

    for (var i = 0; i < 4; i++) {
      this.slots.push(new Slot('topslot'));
    }

    for (var i = 0; i < 7; i++) {
      this.stacks.push(new Slot('stack'));
    }

    // Populate all our available this.cards
    var suites = ['clubs', 'diamonds', 'hearts', 'spades'];
    var types = ['ace', 'jack', 'queen', 'king'];
    for (var suite in suites) {
      for (var i = 2; i <= 10; i++) {
        this.cards.push(new Card(suites[suite], i));
      }

      for (var type in types) {
        this.cards.push(new Card(suites[suite], types[type]));
      }
    }

    // Shuffle cards... (SugarJS)
    this.cards = this.cards.randomize()

    // Stacks
    for (var i = 0; i < 7; i++) {
      for (var j = 0; j < i+1; j++) {
        this.stacks[i].cards.push(this.cards.shift())
      }
    }

    // Stuff remaining ones into front deck
    var card;
    while ((card = this.cards.shift()) != undefined) {
      this.deck[0].cards.push(card)
    }
  }
}
