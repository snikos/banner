"use strict";

if (!Array.prototype.shuffle) {
  Array.prototype.shuffle = function() {
    /* var. 1: well good */
    for (var i = this.length - 1; i > 0; i--) {
      var num = Math.floor(Math.random() * (i + 1));
      var d = this[num];
      this[num] = this[i];
      this[i] = d;
    }
    return this;
    
    /* var. 2: well work */
    /*var m = this.length, t, i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = this[m];
      this[m] = this[i];
      this[i] = t;
    }
    return this;*/
  }
};

var FlagEffects = (function (muta) {

    init();

    function init() {

      if ( $('#confirm_box') )
      {
        $(document).find('#confirm_box').remove();
      }

      /* init storage */
      var objFlags = {
        "winning_step":"0",
        "losses_step":"0",
        "your_level_wisdom":"Unknown",
        "test_step":"0"
      };
      var objSets = {
        "setting_allsteps":"4",
        "setting_curlevel":"2",
        "setting_alltests":"0"
      };
      initLS('lsFlags', objFlags);
      initLS('lsSets', objSets);

      textLevel();

      addFlags( workStorage('lsSets', 'get', 'setting_curlevel') )

      addDuck('flag', 'duck');

      whichThisCountry(boxQuest);

      userLevel( workStorage('lsFlags', 'get', 'test_step'), workStorage('lsFlags', 'get', 'winning_step'));

      $('#nextStep').prop('disabled', true);

      exprComma();
    };

    function update(){

      addFlags( workStorage('lsSets', 'get', 'setting_curlevel') )

      workStorage('lsFlags', 'init');
      workStorage('lsSets', 'init');

      addDuck('flag', 'duck');

      whichThisCountry(boxQuest);
      userLevel( workStorage('lsFlags', 'get', 'test_step'), workStorage('lsFlags', 'get', 'winning_step'));

      $('#nextStep').prop('disabled', true);
    };

    function converterEngine(input) { // fn BLOB => Binary => Base64 ?
      var uInt8Array = new Uint8Array(input),
            i = uInt8Array.length;
      var biStr = []; //new Array(i);
      while (i--) { biStr[i] = String.fromCharCode(uInt8Array[i]);  }
      var base64 = window.btoa(biStr.join(''));
      return base64;
    }

    function getBaseUri(url, callback) {
      // to comment better
      var xhr = new XMLHttpRequest(url), img64;
      xhr.open('GET', url, true); // url is the url of a PNG/JPG image.
      xhr.responseType = 'arraybuffer';
      xhr.callback = callback;
      xhr.onload  = function(){
          img64 = converterEngine(this.response); // convert BLOB to base64
          this.callback(img64); // callback : err, data
      };
      xhr.onerror = function(){ callback('B64 ERROR', null); };
      xhr.send();
    }

    /* get base64 with help canvas */
    /*function getBaseUri(url){
      var img = new Image();
      img.src = url;
      img.onload = function(){
        var canvas = document.createElement("canvas");
        canvas.width =this.width;
        canvas.height =this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);

        var dataURL = canvas.toDataURL('image/png', 1.0);
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
      }
    }*/

    function initLS(lsname, data)
    {
      if( window.localStorage[lsname] === undefined ){
        workStorage(lsname, 'clear', data);
      } else {
        workStorage(lsname, 'init', data);
      }
    }

    function removeLS(){
      var obj = JSON.parse( window.localStorage['lsFlags'] );
      $.each(obj, function(key, val){
        $('[data-id="'+key+'"]').text( '~~~' );
      });
      window.localStorage.removeItem( 'lsFlags' );
    };

    function nextGame( container ){
      var count = +workStorage('lsSets', 'get', 'setting_alltests');
      workStorage('lsSets', 'set', {'setting_alltests': count+=1 });
      //workStorage('lsRanNum', 'set', '0');

      var data = workStorage('lsFlags', 'get');
      var stats = +workStorage('lsSets', 'get', 'setting_alltests');

      var stats_tb = '<tr><td colspan="2"><b>Your statistic of the test:</b></td></tr>';
          stats_tb += '<tr><td>Pass of the tests:</td><td>'+stats+'</td></tr>';
        $.each( data, function ( key, val ){
          stats_tb += '<tr><td>'+key+'</td><td>'+val+'</td></tr>';
        });
      var button = $('<a>', {
        'href': '#',
        'class': 'next_game uk-button uk-button-default',
        'html': 'Start next round'
      });
      var stats_ul = $('<table>', {
        'class': 'green_table table_list'
      }).append(stats_tb);
      var inner_box = $('<div>', {}).append(button).append(stats_ul);
      var conf_box = $('<div>', {
        'id': 'confirm_box'
      }).append(inner_box);

      conf_box.appendTo( container );
    };

    function randomizer(){
      var ran_num = muta.split('~\n');//metka.split('~\n');
      var ran_png = Math.round( Math.random() * ran_num.length );
      var ran_flag = ran_num[ ran_png ];
      return ran_flag;
    };

    function userLevel(total, win)
    {
      testLevel();
      var florida_man = ['Lets go, dude!','It\'s no go.','Next time lucky.','Make headway, Not bad','It was quite a job!','Your RAM is awesome=)'];
      var level = (win / 10 * 100).toFixed(2);
      var result = '', fman = '';
      if( level < 20 ){ result = "Uneducated (1)"; fman = florida_man[1]; }
      if( level >= 20 && level <= 40 ){ result = "Initial (2)"; fman = florida_man[2]; }
      if( level >= 40 && level <= 60 ){ result = "Middle (3)"; fman = florida_man[3]; }
      if( level >= 60 && level <= 80 ){ result = "High (4)"; fman = florida_man[4]; }
      if( level > 80 ){ result = "Awesome (5)"; fman = florida_man[5]; }
      if( isNaN(level) ){ result = "Unknown (-1)"; fman = florida_man[0]; }
      $('[data-id="florida_man"]').text( fman );
      return result;
    };

    function textLevel()
    {
      var num_lvl = workStorage('lsSets', 'get', 'setting_curlevel'), lvl;
      switch( num_lvl ){
        case"2": lvl = 'easy';
        break;
        case"4": lvl = 'middle';
        break;
        case"6": lvl = 'hard';
        break;
        case"8": lvl = 'the hell';
        break;
        default: lvl = 'easy';
      }
      $('#level_game option').map( function( idx,el ){
        if( $(el).val() === workStorage('lsSets', 'get', 'setting_curlevel') )
          {
            $(el).prop('selected', 'selected');
            $('[data-id="setting_curlevel"').text( lvl )
            //$(el).prop('selected', true);
          }
      });
    }

    function testLevel(){
      $('[data-id="setting_curlevel"]').text( $('#level_game :selected').text() );
    }

    function woodoo(wd){
      var gtm = ['mishmash','doodle','humbug','hodgeponge','willy-nilly','gibberish','dabble'];
      var roundFight = Math.round( Math.random() * (gtm['length']-1) );
      var _w = gtm[roundFight];
      var ns = '';
      $.each(_w.split(''), function(idx, el){
        _w.replace( el, function(lol){
          (idx%2===0) ? ns += lol.toUpperCase() : ns += lol.toLowerCase();
        });
      });
      var hobana = ns[ns.length-1].toUpperCase();
      if( hobana === 'G' ) ns = ns + 'er';
      if( hobana === 'E' ) ns = ns + 'r';
      if( hobana === 'H' ) ns = 'Ahtung('+ns+')';
      if( hobana === 'Y' ) ns = ns + '-waffen!';
      return ns;
    }

    function setFlag(selector){
      var rightData = Math.round( +($(selector).length-1) * Math.random());
      var _arr = [];

      var lenFlags = $(selector).length;
      var uniqueCountries = function(){
        var ranName = randomizer();//country.png
        if( _arr.filter( function(idx){ return idx===ranName } ) ){
          _arr.push(ranName);
        }

        /*for expr*/
        //$.inArray(ranName, _arr);

        var uni = function(aa){
          var res=[];
          $.each(aa, function(idx, el){
            if( !res.includes(el) ) res.push(el);
          });
          return res;
        };
        _arr = uni(_arr);

        if( _arr.length >= lenFlags ){
          return _arr;
        } else {
          uniqueCountries();
        }
        return _arr;
      };
      var usArray = uniqueCountries();

      $('#message').text('---');
      $(selector, document).each( function(idx, el){

        //var alt = (usArray[idx].split('.')[0]).trim();
        //var olt = mixAlt(alt);

        var url = ('country/128/'+usArray[idx]);
        var urlBase64 = ('country/128/'+ window.btoa(usArray[idx]));
        //console.log(urlBase64);

        getBaseUri(url, function(data){
          var quest = function(tt){
            return 'Select a flag of <b>"'+tt+'"</b>';
          };
          var alt = (usArray[idx].split('.')[0]).trim();
          var attros = {
            'src': 'data:image/png;base64,'+ data,
            'alt': woodoo(alt)
          };
          $(el).attr(attros);
          $(el).data('answer', alt);

          if ( idx === rightData )
          {
            $('body').data('right_ant', alt);
            $('#boxQuest').html( quest(alt) );
          }
        });

        var shot = [];
        $('#flag_block div').each( function(idx, el){
          shot.push(el);
        });
        shot.shuffle();
        $.each( shot, function(idx, el){
          $('#flag_block').append(el);
        });
      });
    };

    function addDuck(cls, newcls){
      $('.'+cls, document).each(function( idx, el ) {
        $(el).addClass(newcls);
      });
    };

    function dieDuck(cls, newcls){
      $(cls, document).each(function( idx, el ) {
        $(el).removeClass(newcls);
      });
    };

    function decision(){
      //var curAlt = $(this).attr('alt') || $(this).data('answer');
      var curAlt = $(this).data('answer');
      var curData = $('body').data('right_ant');

      var new_tg = +workStorage('lsSets',  'get', 'setting_allsteps');
      var new_wg = +workStorage('lsFlags', 'get', 'winning_step');
      var new_lg = +workStorage('lsFlags', 'get', 'losses_step');
      var new_sg = +workStorage('lsFlags', 'get', 'test_step');
      var new_ul;

      //$(this).addClass('axe');
      $('#nextStep').prop('disabled', false);
      $('.flag', document).each( function(idx, el){
        var a = $(el).data('answer');

        if( curData === a ){
          var name = $(el).data('answer'), cls = '';
          ( curAlt === name ) ? cls = 'cls-honor' : cls = 'cls-loser';
          
          $(el).closest('div').addClass(cls)
          $(el).addClass('axe');
          $(el).before('<b id="hint-word">'+name+'</b>');
        } else {
          $(el).addClass('silent')
        }
      });

        //new_tg += 1;
        new_sg += 1;

      if( curAlt === curData ){

        new_wg += 1;
        $('#message').addClass('right_message').html('Congrats! <b>'+curData+'!</b>');
        $('#plusWord tbody').append('<tr><td>'+curAlt+'</td></tr>');
      } else {
        new_lg += 1;
        $('#message').addClass('error_message').html('You made a mistake! You chosen <b>'+curAlt+'.</b>');
        $('#minusWord tbody').append('<tr><td><del>'+curAlt+'</del></td></tr>');
      }

      $('#flag_block').addClass('mirror');

      new_ul = userLevel(new_sg, new_wg);
      workStorage('lsSets',  'set', {'setting_allsteps': new_tg});
      workStorage('lsFlags', 'set', {'winning_step': new_wg});
      workStorage('lsFlags', 'set', {'losses_step': new_lg});
      workStorage('lsFlags', 'set', {'your_level_wisdom': new_ul});
      workStorage('lsFlags', 'set', {'test_step': new_sg});

      textLevel();

      if( new_sg >= new_tg ){
        //$('#plusWord, #minusWord').find('tbody').empty();
        //nextGame( $('body') );
        /*var tplResult = $('<a>', {
          'class': 'next_game btn',
          'href' : '#',
          'html' : 'Start next round'
        });*/
        $('#nextStep').prop('disabled', true);
        $('#message').addClass('goon_message').html('Click a button to see <a href="#" id="seeYourResult" class="uk-button uk-button-default"><b>your result</b></a> or to play <a href="#" class="next_game uk-button uk-button-default"><b> next round.</b></a>');
      }
    }

    function goOnNext(){
      $('#plusWord, #minusWord').find('tbody').empty();
      nextGame( $('body') );
    }

    function whichThisCountry(boxQuest, boxForm){
      setFlag('.flag');
    }

    /* Events */

    $('#nextStep').on('click', function(){

      $('#flag_block').removeClass('mirror');

      whichThisCountry(boxQuest);
      $('.flag', document).removeClass('axe silent').closest('div').removeClass('cls-honor cls-loser');
      $('#hint-word', document).remove();
      $('#message').attr('class','');
      $(this).prop('disabled', true);
      dieDuck('flag','duck');
      return false;
    });

    $(document).on('click', '.flag', decision);

/*
* Settings
*/

  function addFlags(level){
    $('#flag_block').empty();
    var cut=level;
    if( level >= 6 ) cut/=2;
    for( var i=0; i<level; i++)
    {
      var img = $('<img/>', {
        'class': 'flag',
        'src': '',
        'alt': 'f-'+i
      });
      var tag = $('<div>', {
        'class': 'col w1-'+cut
      }).append( img );
      $('#flag_block').append( tag );
    }
    $('#flag_block').append('<hr class="clear"/>');
  }

  $('#level_game').on('change', function(){
    var lvl = $(this).val();
    addFlags( lvl );
    workStorage('lsSets', 'set', {'setting_curlevel': lvl});
    workStorage('lsSets',  'set', {'setting_allsteps': (lvl*2)});
    update();
  });

  $(document).on('click', '.next_game', function(event){
    event.preventDefault();
    //var value = +workStorage('lsSets', 'get', 'setting_alltests');
    $('#plusWord, #minusWord').find('tbody').empty();
    $('#flag_block').removeClass('mirror');
    $('#message').attr('class','');
    removeLS();
    //workStorage('lsSets', 'set', {'setting_alltests': value+=1 });
    init();
  });

  $(document).on('click', '#hintOpen', function(){
    $('#hintFlag').toggleClass('open');
    return false;
  });

  $(document).on('click', '#seeYourResult', function(){
    goOnNext();
    return false;
  });

/*
* expr local storage
*/
      // lsname: name of ls
      // mtd: 'clear','init','get','set'
      // val: {key: value}
      function workStorage(lsname, mtd, val){
        var obj = window.localStorage[lsname];

        if( mtd === 'clear' )
        {
          window.localStorage[lsname] = JSON.stringify(val);
          $.each(val, function(k, v){
            $('[data-id="'+k+'"]').text( v );
          });
          return;
        }
        if( mtd === 'init' ){
          var o = JSON.parse(obj);
          $.each(o, function(key, val){
            $('[data-id="'+key+'"]').text( val );
          });
        }
        if( mtd === 'get' )
        {
          var value;
          if ( val ) value = JSON.parse(obj)[val];
          else value = JSON.parse(obj);
          return value;
        }
        if( mtd === 'set' )
        {
          var clone = Object.assign({}, JSON.parse(obj));
          Object.assign(clone, val);
          window.localStorage[lsname] = JSON.stringify(clone);
          $.each(clone, function(key, val){
            $('[data-id="'+key+'"]').text( val );
          });
        }
      };

/***************************/
/* v1. transition hack */
function transitionEndsOnce($dom, pname, callback) {
  var tick = Date.now();
  $dom.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function(event) {
    if( event.propertyName !== pname ) return;
    var diff = Date.now() - tick;
    tick = Date.now();
    if (diff > 20) { // this number can be changed, but normally all the event trigger are done in the same time
      return callback && callback(event);
    }
  });
}

/* v.2 transition hack */
var getValues = function( str ){
  return str
    .replace(/[A-Z]/gi, '')
    .split(', ')
    .map(parseFloat);
}
var getMaxTransitionProp = function(el){
  var style = window.getComputedStyle(el);
  var props = style.transitionProperty.split(', ');

  var delays = getValues(style.transitionDelay);
  var durations = getValues(style.transitionDuration);
  var totals = durations.map(function(v, i) {
    return v + delays[i];
  });

  var maxIndex = totals.reduce(function(res, cur, i) {
    if (res.val > cur) {
      res.val = cur;
      res.i = i;
    }
    return res;
  }, {
    val: -Infinity,
    i: 0
  }).i;

  return props[maxIndex];
}
var lastEventListenerFor = function(el, cb) {
  var lastProp = getMaxTransitionProp(el);
  return function(e) {
    if (e.propertyName == lastProp) {
      cb(e);
    }
  };
}


function exprComma(){
  var code = hintFlag.firstChild.nextSibling.nodeValue;
  var cobra = $(':root', document).data('cobra');
  return 'maybe next time';
}

})(metka);