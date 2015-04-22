'use strict';
var myfn = {}; var curImg; var myDone = function() {
    setInterval(function() {
        $('#main').addClass('zen-mode');
        myfn.close();
    }, 30);
    $('.depthy-viewer').css({
        "background": "url(samples/" + curImg + "-blur.jpg)",
        "background-size": "cover",
        "background-position": "50% 50%"
    });
    setTimeout(function() {
        parent.done();
    }, 500);
};
angular.module('depthyApp', [
  'ngAnimate',
  'ngTouch',
  'ga',
  'shareUrls',
  // 'visibleClass',
  // 'mgcrea.ngStrap.modal',
  // 'mgcrea.ngStrap.popover',
  // 'mgcrea.ngStrap.button'
  'ui.router',
  'ui.bootstrap.buttons',
  'ui.bootstrap.modal',
  'ui.bootstrap.transition',
  'ui.bootstrap.dropdown',
])
//fix blob
.config(function($compileProvider) {
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|blob):|data:image\//);
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);
})
.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(false);
  // $locationProvider.hashPrefix('!');

  $urlRouterProvider.otherwise('/');

  $stateProvider
  .state('index', {
    url: '/',
    onEnter: ['depthy', '$state', function (depthy, $state) {
      if (!$state.current.name) {
        // first timer
        depthy.leftpaneOpen();
        curImg = 'p1';
        depthy.loadSampleImage('p1');
      }
    }]
  })
  .state('sample', {
    url: '/sample/:id',
    controller: ['$stateParams', 'depthy', function ($stateParams, depthy) {
      depthy.loadSampleImage($stateParams.id);
    }]
  })
  .state('imgur', {
    url: '/ip/:id',
    controller: ['$stateParams', '$state', 'depthy', function ($stateParams, $state, depthy) {
      depthy.loadUrlDirectImage('https://i.imgur.com/' + $stateParams.id + '.png', true, {
        state: 'imgur',
        stateParams: {id: $stateParams.id},
        thumb: 'https://i.imgur.com/' + $stateParams.id + 's.jpg',
        storeUrl: 'https://imgur.com/' + $stateParams.id,
        store: depthy.stores.imgur
      });
    }]
  })
  .state('imgur2', {
    url: '/ii/:id',
    controller: ['$stateParams', 'depthy', function ($stateParams, depthy) {
      depthy.loadUrlImage('https://i.imgur.com/' + $stateParams.id + '.png', {
        state: 'imgur2',
        stateParams: {id: $stateParams.id},
        thumb: 'https://i.imgur.com/' + $stateParams.id + 'm.jpg',
        storeUrl: 'https://imgur.com/' + $stateParams.id,
        store: depthy.stores.imgur
      });
    }]
  })
  .state('url-png', {
    url: '/up?url',
    controller: ['$stateParams', '$state', 'depthy', function ($stateParams, $state, depthy) {
      depthy.loadUrlDirectImage($stateParams.url, true, {
        state: 'url-png',
        stateParams: {url: $stateParams.url},
        // thumb: $stateParams.url,
      });
    }]
  })
  .state('url-auto', {
    url: '/u?url',
    controller: ['$stateParams', '$state', 'depthy', function ($stateParams, $state, depthy) {
      depthy.loadUrlImage($stateParams.url, {
        state: 'url-auto',
        stateParams: {url: $stateParams.url},
        // thumb: $stateParams.url,
      });
    }]
  })
  // hollow state for locally loaded files
  .state('local', {
    url: '/local/:id',
    hollow: true,
    controller: ['$stateParams', 'depthy', function($stateParams, depthy) {
      depthy.loadLocalImage($stateParams.id);
    }]
  })
  // hollow states for back button on alerts
  .state('alert', {
    url: '/alert',
  })
  .state('image', {
    url: '/image',
  })
  .state('image.options', {
    url: '/options',
  })
  .state('image.info', {
    url: '/info',
  })
  .state('export', {
    url: '/export',
  })
  .state('export.png', {
    url: '/png',
  })
  .state('export.jpg', {
    url: '/jpg',
  })
  .state('export.gif', {
    url: '/gif',
  })
  .state('export.gif.options', {
    url: '/options',
  })
  .state('export.gif.run', {
    url: '/run',
  })
  .state('export.webm', {
    url: '/webm',
  })
  .state('export.webm.options', {
    url: '/options',
  })
  .state('export.webm.run', {
    url: '/run',
  })
  .state('export.anaglyph', {
    url: '/anaglyph',
  })
  .state('share', {
    url: '/share',
  })
  .state('share.options', {
    url: '/options',
  })
  .state('share.png', {
    url: '/png',
  })
  .state('draw', {
    url: '/draw',
    hollow: true,
    onEnter: ['depthy', '$timeout', function(depthy, $timeout) {
      $timeout(function() {
        depthy.drawModeEnable();
      })
    }],
    onExit: ['depthy', function(depthy) {
      depthy.drawModeDisable();
    }],
  })
  .state('pane', {
    url: '/pane',
    hollow: true,
    onEnter: ['depthy', function(depthy) {
      depthy.leftpaneOpen();
    }],
    // onExit: ['depthy', function(depthy) {
    //   depthy.leftpaneClose();
    // }]
  })
  .state('howto', {
    url: '/howto',
  })
  .state('howto.lensblur', {
    url: '/lensblur',
    onEnter: ['StateModal', function(StateModal) {
      StateModal.showModal('howto.lensblur', {
        stateCurrent: true,
        templateUrl: 'views/howto-lensblur.html',
      });
    }]
  })
  ;
})
.run(function($rootScope, ga, $location, $state) {
  // check first state
  var stateChangeStart = $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
    stateChangeStart();
    console.log(event, toState, toParams, fromState);
    if (toState.hollow || !toState.controller && !toState.onEnter && !toState.template && !toState.templateUrl) {
      console.warn('Hollow state %s', toState.name);
      event.preventDefault();
      $state.go('index');
    }
  });
  $rootScope.$on('$stateChangeSuccess', function() {
    ga('set', 'page', $location.url());
    ga('send', 'pageview');
  });
});
'use strict';

angular.module('depthyApp').provider('depthy', function depthy() {

  // global settings object, synchronized with the remote profile, only simple values!
  var viewer = angular.extend({}, DepthyViewer.defaultOptions, {
    hoverElement: 'body',
    fit: Modernizr.mobile ? 'cover' : 'contain',
    depthScale: Modernizr.mobile ? 2 : 1,
  });

  this.$get = function(ga, $timeout, $rootScope, $document, $window, $q, $modal, $state, StateModal, UpdateCheck) {

    var leftpaneDeferred, depthy,
      history = [];

    function isImageInfo(info) {
      return info && info.isShareable && info.isStoreable;
    }

    function createImageInfo(info) {

      var self = angular.extend({
        imageSource: null,
        depthSource: null,
        depthUsesAlpha: false,
        originalSource: null,

        // state it was opened from
        state: null,
        stateParams: null,

        // True if waiting for results
        loading: false,
        // loaded from this url
        url: undefined,
        // TRUE if local file
        local: undefined,
         // image was parsed
        parsed: undefined,
        // id of local sample
        sample: undefined,
        // 
        title: false,
        // thumbnail url
        thumb: false,
        // storage service used
        store: false,
        // stored under this url
        storeUrl: false,
        // store secret key, if any
        storeKey: false,

        // time when first added to history
        added: false,
        // time last viewed
        viewed: false,
        // views count
        views: 0,
        sharedAs: null,

        // true if it's shareable directly
        isShareable: function() {
          return self.state && !self.local;
        },
        // true if it's a user's share
        isShared: function() {
          return !!self.storeKey;
        },
        isStoreable: function() {
          return !!(self.isShareable() && self.isConfirmed() && self.thumb && self.thumb.length < 500);
        },
        isEmpty: function() {
          return !(self.url || self.local || self.sample || self.procesing) || self.empty;
        },
        isOpened: function() {
          return depthy.opened === self;
        },
        // returns true for images that loaded successfully in the past
        isConfirmed: function() {
          return self.viewed || self.sample || self.isShared() && self.thumb;
        },
        isLocal: function() {
          return !!self.local;
        },
        isSample: function() {
          return !!self.sample;
        },
        isRemote: function() {
          return !!self.url;
        },
        isModified: function() {
          return !!self.modified;
        },
        isAvailable: function() {
          return !depthy.isOffline() || this.isSample() || this.isLocal();
        },
        // returns the type
        getType: function() {
          if (self.isLocal()) return 'local';
          if (self.isModified()) return 'modified';
          if (self.isShared()) return 'shared';
          if (self.isSample()) return 'sample';
          if (self.isRemote()) return 'remote';
          return 'unknown';
        },
        getFilename: function() {
          return self.title || (self.stateParams && self.stateParams.id) || 'image';
        },
        getStateUrl: function() {
          if (!self.state) return false;
          return $state.href(self.state, self.stateParams || {});
        },
        openState: function() {
          if (!self.state) throw 'No state to go to';
          $state.go(self.state, self.stateParams);
        },
        // returns shareUrl
        getShareUrl: function(followShares) {
          if (self.sharedAs && followShares !== false) return self.sharedAs.getShareUrl(false);
          if (!self.isShareable()) return false;
          return depthy.rootShareUrl + self.getStateUrl();
        },
        getShareInfo: function(followShares) {
          if (self.sharedAs && followShares !== false) return self.sharedAs.getShareInfo(false);
          var url = self.getShareUrl(false);
          if (!url) return null;
          return {
            url: url,
            title: (self.title ? self.title + ' ' : '') + '#depthy',
            img: self.thumb && (self.thumb.match(/^https?:/) ? self.thumb : depthy.rootShareUrl + self.thumb),
          };
        },
        getShareImage: function() {
          return self.sharedAs || self;
        },
        // creates new image, based on this one, and sets it as sharedAs
        createShareImage: function(info) {
          info = angular.extend({
            sharedFrom: self,
            title: self.title,
            thumb: self.thumb,
          }, info);
          var share = lookupImageHistory(info, true);
          self.sharedAs = share;
          storeImageHistory();
          updateImageGallery();
          return share;
        },
        markAsModified: function() {
          // self.shareUrl = self.store = self.storeUrl = false;
          // it's no longer shared here!
          self.sharedAs = null;
          self.modified = true;
        },
        onOpened: function() {
          self.loading = false;
          self._checkIfReady();
        },
        // fire when depthmap is opened later on
        onDepthmapOpened: function() {
          self.loading = false;
          self._checkIfReady();
        },
        _checkIfReady: function() {
          if (!self.state) return false;
          if (!self.isOpened() || !depthy.isReady() || !depthy.hasDepthmap()) return false;
          this.onViewed();
        },
        onViewed: function() {
          if (!self.thumb) {
            depthy.getViewer().exportImage({size: {width: 75, height: 75}, quality: 0.8}).then(function(url) {
              self.thumb = url;
              console.log('Thumbnail generated %db', url.length);
              $rootScope.$safeApply();
            });
          }
          self.viewed = new Date().getTime();
          self.views += 1;
          updateImageGallery();
          storeImageHistory();
          $rootScope.$safeApply();
        },
        onClosed: function() {
          // cleanup a bit
          if (!self.sample && !self.isModified()) {
            self.imageSource = self.depthSource = self.originalSource = self.depthUsesAlpha = false;
          }
          self.loading = false;
        },
        addToHistory: function() {
          if (history.indexOf(self) < 0) {
            if (self.added === false) self.added = new Date().getTime();
            history.push(self);
          }
        },
        removeFromHistory: function() {
          _.remove(history, function(a) {return a === self;});
        },
        // tries to reopen this image if it has minimum set of info. Returns promise on success
        tryToReopen: function() {
          if (self.isOpened()) return depthy.getReadyPromise();
          // imageSource is enough to open
          if (!self.imageSource) return false;
          console.log('%cReopening image: %o', 'font-weight: bold', self);
          openImage(self);
          depthy.getViewer().setDepthmap(self.depthSource, self.depthUsesAlpha);
          return depthy.refreshOpenedImage()
          // .catch(function() {
          //  self.error = 'Image could not be reopened!';
          // })
          .finally(self.onOpened);
        }
      }, info || {});
      return self;
    }

    /* @param info - image info to lookup
       @param createMode - truey creates missing image, 'extend' extends existing, otherwise defaults existing */
    function lookupImageHistory(info, createMode) {
      var image;
      if (isImageInfo(info)) return info;
      if (info.state) {
        if (info.state === true) {
          info.state = $state.current.name;
          info.stateParams = $state.params;
          // console.log('lookupImageHistory state detected as ', info.state, info.stateParams);
        }
        image = _.find(history, {state: info.state, stateParams: info.stateParams});
        // console.log('%cFound %o in history when looking for %o', 'font-weight:bold', image, info);
      }
      if (image) {
        _[createMode === 'extend' ? 'extend' : 'defaults'](image, info);
      } else if (createMode) {
        image = createImageInfo(info);
        if (image.state) image.addToHistory();
      }
      return image;
    }

    // used internally
    function prepareImage(info, extraInfo) {
      if (extraInfo) info = angular.extend(info, extraInfo);
      var opened = lookupImageHistory(info, 'extend');
      return opened;
    }

    function openImage(image) {
      if (image.isOpened()) return image;
      if (depthy.opened) {
        depthy.opened.onClosed();
        depthy.getViewer().reset();
      }
      image.loading = true;
      depthy.opened = image;
      return depthy.opened;
    }

    function updateImageGallery() {
      console.log('updateImageGallery');
      var gallery = _.filter(history, function(image) {
        return image.isConfirmed();
      });

      gallery.sort(function(a, b) {
        if (a.added === b.added) return 0;
        return a.added > b.added ? -1 : 1;
      });

      depthy.gallery = gallery;
    }

    var storeImageHistory = _.throttle(function storeImageHistory() {
      if (!Modernizr.localstorage) return;

      var store = history.filter(function(image) {
        return image.isStoreable();
      }).map(function(image) {
        return _.pick(image, ['state', 'stateParams', 'title', 'url', 'thumb', 'added', 'viewed', 'views', 'storeKey']);
      });

      console.log('storeImageHistory', history, store);
      window.localStorage.setItem('history', JSON.stringify(store));

    }, 4000, {leading: false});

    function restoreImageHistory() {
      // recreate samples
      depthy.samples.forEach(function(sample) {
        lookupImageHistory({
          state: 'sample',
          stateParams: {id: sample.id},
          sample: sample.id,
          title: sample.title,
          thumb: 'samples/' + sample.id + '-thumb.jpg',
          imageSource: 'samples/' + sample.id + '-image.jpg',
          depthSource: 'samples/' + sample.id + '-depth.jpg',
          originalSource: 'samples/' + sample.id + '-alternative.jpg',
          added: 0,
        }, true);
      });

      // read history
      if (!Modernizr.localstorage) return;
      var stored = JSON.parse(localStorage.getItem('history') || 'null');
      if (!angular.isObject(stored)) return;
      console.log('restoreImageHistory', stored);
      stored.forEach(function(image) {
        // don't recreate non existing samples... default the rest.
        image = lookupImageHistory(image, image.state === 'sample' ? false : 'default');
        if (image && !image.isStoreable()) image.removeFromHistory();
      });
    }

    var _storeableViewerKeys = ['fit', 'animate', 'animateDuration', 'animatePosition', 'animateScale', 'depthScale', 'depthFocus', 'tipsState', 'qualityStart'],
        _storeableDepthyKeys = ['useOriginalImage', 'exportSize', 'tipsState'];

    var storeSettings = _.throttle(function storeSettings() {
      if (!Modernizr.localstorage) return;
      if (depthy.isViewerOverriden()) return;
      var store = _.pick(depthy, _storeableDepthyKeys);
      store.viewer = _.pick(viewer, _storeableViewerKeys);
      store.version = depthy.version;
      store.storedDate = new Date().getTime();

      console.log('storeSettings', store);
      window.localStorage.setItem('settings', JSON.stringify(store));

    }, 4000, {leading: false});

    function restoreSettings() {
      // read history
      if (!Modernizr.localstorage) return;
      var stored = JSON.parse(localStorage.getItem('settings') || 'null');
      if (!angular.isObject(stored)) return;

      _.merge(depthy, _.pick(stored, _storeableDepthyKeys));
      _.merge(depthy.viewer, _.pick(stored.viewer, _storeableViewerKeys));

      depthy.storedDate = stored.storedDate;
      if (stored.version !== depthy.version) {
        installNewVersion(stored.version);
      }
      showNewStuff();

      console.log('restoreSettings', stored);
      //
    }

    function installNewVersion(old) {
      console.log('New version %s -> %s', old, depthy.version);

      // assume that new users know everything that is new...
      if (!old) hideNewStuff();

      storeSettings();
    }

    function showNewStuff() {
      var newStuff = {
        205: 'Export high quality videos on chrome.',
        206: 'GIFs look waaay better now.',
        300: 'Paint depthmaps in your browser.',
        301: 'Save images as LensBlur JPG.',
        302: 'Create anaglyph 3D images.',
      };
      depthy.newStuff = [];
      _.each(newStuff, function(txt, v) {
        if (v > (depthy.tipsState.newStuff || 0)) depthy.newStuff.push(txt);
      });
    }

    function hideNewStuff() {
      depthy.newStuff = [];
      depthy.tipsState.newStuff = depthy.version;
      storeSettings();
    }

    function checkUpdate() {
      // force the update daily
      UpdateCheck.check(depthy.storedDate && (new Date().getTime() - depthy.storedDate > 86400000)).then(function(found) {
        if (found) depthy.gotUpdate = true;
        storeSettings();
      });
    }

    function initialize() {
      $rootScope.$on('$stateChangeSuccess', function() {
        depthy.zenMode = false;
      });

      openImage(createImageInfo({empty: true}));

      restoreSettings();
      checkUpdate();
      restoreImageHistory();
      updateImageGallery();

      $rootScope.$watch(function() {
        var store = _.pick(depthy, _storeableDepthyKeys);
        store.viewer = _.pick(viewer, _storeableViewerKeys);
        return store;
      }, function(n, o) {
        if (n === o) return;
        storeSettings();
      }, true);

      // monitor quality
      $rootScope.$watch(function() {
        return depthy.getViewer().getQuality();
      }, function(n, o) {
        if (n === o) return;
        viewer.qualityStart = depthy.getViewer().getQuality();
        ga('set', 'dimension2', viewer.qualityStart);
        storeSettings();
      }, true);
    }

    depthy = {
      viewer: viewer,

      version: 301,
      tipsState: {},
      lastSettingsDate: null,

      exportSize: Modernizr.mobile ? 150 : 300,
      exportType: 'gif',

      imgurId: 'b4ca5b16efb904b',

      rootShareUrl: 'https://depthy.me/',
      share: {
        url: 'https://depthy.me/',
      },

      // true - opened fully, 'gallery' opened on gallery
      leftpaneOpened: false,
      activePopup: null,

      movearoundShow: false,

      zenMode: false,
      drawMode: false,

      opened: null,

      useOriginalImage: false,

      modalWait: 700,
      debug: false,

      gallery: [],

      samples: [
        { id: 'p1', title: 'p1'},
        { id: 'p2', title: 'p2'},
      ],

      stores: {
        imgur: {
          name: 'imgur'
        }
      },

      downloadInstructions: Modernizr.adownload ? 'Click the image' : Modernizr.mobile ? 'Touch and hold the image' : 'Right-click the image',

      getVersion: function() {
        return Math.floor(this.version / 10000) + '.' + Math.floor(this.version % 10000 / 100) + '.' + (this.version % 100);
      },
      isReady: function() {
        return this.getViewer().isReady();
      },
      isLoading: function() {
        return !!this.opened.loading && Modernizr.webgl;
      },
      hasImage: function() {
        return this.getViewer().hasImage();
      },
      hasDepthmap: function() {
        return this.getViewer().hasDepthmap();
      },
      hasOriginalImage: function() {
        return !!this.opened.originalSource;
      },
      hasCompleteImage: function() {
        return this.hasImage() && this.hasDepthmap();
      },
      getLoadError: function() {
        return this.opened.error;
      },
      // true when leftpane is incollapsible
      isFullLayout: function() {
        return $window.innerWidth >= 1200;
      },
      isOffline: function() {
        return navigator.onLine === false;
      },
      isViewerOverriden: function(override) {
        if (override !== undefined) depthy.viewerOverriden = override;
        return depthy.viewerOverriden || depthy.exportActive;
      },
      getViewerCtrl: function() {
        if (!this._viewerCtrl) {
          this._viewerCtrl = angular.element('[depthy-viewer]').controller('depthyViewer');
        }
        return this._viewerCtrl;
      },

      getViewer: function() {
        if (!this._viewer) {
          this._viewer = this.getViewerCtrl().getViewer();
        }
        return this._viewer;
      },

      storeSettings: storeSettings,
      hideNewStuff: hideNewStuff,

      // sets proper image according to opened image and useOriginalImage setting
      refreshOpenedImage: function() {
        var opened = this.opened;
        this.getViewer().setImage((depthy.useOriginalImage ? opened.originalSource : opened.imageSource) || opened.imageSource);
        return this.getReadyPromise();
      },

      getReadyPromise: function() {
        return $q.when(depthy.getViewer().getPromise());
      },

      loadImage: function(image) {
        var opened = prepareImage(image);
        if (opened.tryToReopen()) return this.getReadyPromise();
        return $q.reject('Image can\'t be loaded!');
      },

      loadSampleImage: function(name) {
        // samples are already defined, can be only reopened
        return this.loadImage({
          state: 'sample',
          stateParams: {id: name},
        });
      },

      _fileId: 0,
      loadLocalImage: function(file) {

        var fileId = _.isObject(file) ? (++ this._fileId) + '' : file,
        opened = prepareImage({
          state: 'local',
          stateParams: {id: fileId},
          local: true,
          parsed: true,
        });
        if (opened.tryToReopen()) return this.getReadyPromise();
        openImage(opened);

        if (_.isObject(file)) {
          opened.title = (file.name || '').replace(/\.(jpe?g|png)$/i, '');
          opened.imageFile = file;
        } else {
          file = opened.imageFile;
          console.log('Reopening old file', file);
        }

        var deferred = $q.defer();

        if (!file) {
          deferred.reject('Can\'t open this image anymore');
        } else if (file.type && file.type !== 'image/jpeg' && file.type !== 'image/png') {
          deferred.reject('Only JPEG and PNG, please!');
        } else {
          var reader = new FileReader();
          reader.onload = function() {
            deferred.resolve(reader.result);
          };
          reader.readAsArrayBuffer(file);
        }

        return deferred.promise.then(function(data) {
          return depthy._loadFromArrayBuffer(data, opened);
        })
        .catch(function(err) {
          opened.error = err;
        })
        .finally(opened.onOpened);

      },

      loadUrlImage: function(url, openedInfo) {
        var opened = prepareImage({
          url: url,
          parsed: true,
        }, openedInfo);
        if (opened.tryToReopen()) return this.getReadyPromise();
        openImage(opened);

        var xhr = new XMLHttpRequest(),
            deferred = $q.defer();
        //todo: cors
        xhr.open( 'get', url );
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          deferred.resolve(this.response);
        };
        xhr.onerror = function() {
          deferred.reject();
        };
        xhr.send( null );

        return deferred.promise.then(function(data) {
          return depthy._loadFromArrayBuffer(data, opened);
        })
        .catch(function(err) {
          opened.error = angular.isString(err) ? err : 'Image not found!';
        })
        .finally(opened.onOpened);

      },


      loadUrlDirectImage: function(url, isPng, openedInfo) {
        var opened = prepareImage({
          url: url,
          imageSource: url,
          depthSource: isPng ? url : false,
          depthUsesAlpha: isPng,
        }, openedInfo);
        if (opened.tryToReopen()) return this.getReadyPromise();
        openImage(opened);

        this.getViewer().setDepthmap(opened.depthSource, isPng);
        return depthy.refreshOpenedImage()
          .catch(function(err) {
            opened.error = angular.isString(err) ? err : 'Image not found!';
          })
          .finally(opened.onOpened);
      },

      _loadFromArrayBuffer: function(buffer, opened) {
        var byteArray = new Uint8Array(buffer);
        if (isJpg(byteArray)) {
          var reader = new DepthReader(),
              deferred = $q.defer();

          var result = function(error) {
            // no matter what, we use it...
            console.log('DepthExtractor result', error);
            opened.imageSource = URL.createObjectURL( new Blob([buffer], {type: 'image/jpeg'}) );
            opened.depthSource = reader.depth.data ? 'data:' + reader.depth.mime + ';base64,' + reader.depth.data : false;
            opened.originalSource = reader.image.data ? 'data:' + reader.image.mime + ';base64,' + reader.image.data : false;
            depthy.getViewer().setDepthmap(opened.depthSource);
            deferred.resolve(depthy.refreshOpenedImage());
          };

          reader.parseFile(buffer, result, result);
          return deferred.promise;
        } else if (isPng(byteArray)) {
          // 8b signature, 4b chunk length, 4b chunk type
          // IHDR: 4b width, 4b height, 1b bit depth, 1b color type
          var bitDepth = byteArray[24],
              colorType = byteArray[25],
              isTransparent = colorType === 4 || colorType === 6,
              imageSource = URL.createObjectURL( new Blob([buffer], {type: 'image/jpeg'}) );
          console.log('PNG depth %d colorType %d transparent %s', bitDepth, colorType, isTransparent);

          opened.imageSource = imageSource;
          opened.depthSource = isTransparent ? imageSource : false;
          opened.depthUsesAlpha = isTransparent;
          opened.originalSource = false;

          depthy.getViewer().setDepthmap(opened.depthSource, isTransparent);
          return depthy.refreshOpenedImage();

        } else {
          $q.reject('Only JPEG and PNG, please!');
        }
      },

      loadLocalDepthmap: function(file) {
        var reader = new FileReader(),
            deferred = $q.defer(),
            opened = depthy.opened;

        if (file.type === 'image/jpeg') {
          // look for depthmap
          reader.onload = function() {
            var buffer = reader.result,
                byteArray = new Uint8Array(buffer);
            if (isJpg(byteArray)) {
              var depthReader = new DepthReader();
              opened.loading = true;
              var result = function() {
                opened.depthSource = depthReader.depth.data ?
                    'data:' + depthReader.depth.mime + ';base64,' + depthReader.depth.data :
                    URL.createObjectURL( new Blob([buffer], {type: 'image/jpeg'}));
                opened.depthUsesAlpha = false;
                depthy.getViewer().setDepthmap(opened.depthSource);
                deferred.resolve(depthy.getViewer().getPromise());
                deferred.promise.finally(opened.onDepthmapOpened);
              };
              depthReader.parseFile(buffer, result, result);
            } else {
            }
          };
          reader.readAsArrayBuffer(file);
        } else if (file.type === 'image/png') {
          opened.loading = true;
          opened.depthSource = URL.createObjectURL( file );
          opened.depthUsesAlpha = false;
          depthy.getViewer().setDepthmap(opened.depthSource);
          deferred.resolve(depthy.getViewer().getPromise());
          deferred.promise.finally(opened.onDepthmapOpened);
        } else {
          deferred.reject('Only JPEG and PNG files are supported!');
        }
        deferred.promise.finally(function() {
          opened.markAsModified();
        });
        return deferred.promise;

      },

      exportGifAnimation: function() {
        var deferred = $q.defer(), promise = deferred.promise, gif;
        Modernizr.load({
          test: window.GIF,
          nope: 'bower_components/gif.js/dist/gif.js',
          complete: function() {
            var size = {width: depthy.exportSize, height: depthy.exportSize},
                duration = viewer.animateDuration,
                fps = Math.min(25, Math.max(8, (viewer.depthScale * (size < 300 ? 0.5 : 1) * 20) / duration)),
                frames = Math.max(4, Math.round(duration * fps)),
                delay = Math.round(duration * 1000 / frames),
                viewerObj = depthy.getViewer(),
                oldOptions = viewerObj.getOptions();

            gif = new GIF({
              workers: 4,
              quality: 10,
              workerScript: 'bower_components/gif.js/dist/gif.worker.js',
              dither: true,
              globalPalette: true,
            });
            console.log('FPS %d Frames %d Delay %d Scale %d Size %d Duration %d', fps, frames, delay, viewer.depthScale, depthy.exportSize, duration);

            console.time('gif.addFrames');
            for(var frame = 0; frame < frames; ++frame) {
              viewerObj.setOptions({
                size: size,
                animate: true,
                fit: false,
                animatePosition: frame / frames,
                quality: 5,
                pauseRender: true,
              });
              viewerObj.render(true);
              gif.addFrame(viewerObj.getCanvas(), {copy: true, delay: delay});
            }
            console.timeEnd('gif.addFrames');

            gif.on('progress', function(p) {
              deferred.notify(p);
            });
            gif.on('abort', function() {
              promise.abort = function() {};
              deferred.reject();
            });
            gif.on('finished', function(blob) {
              promise.abort = function() {};
              deferred.resolve(blob);
              depthy.viewer.overrideStageSize = null;
              $rootScope.$safeApply();
            });

            promise.finally(function() {
              console.timeEnd('gif.render');
              oldOptions.pauseRender = false;
              viewerObj.setOptions(oldOptions);
            });

            console.time('gif.render');
            gif.render();
          }
        });
        promise.abort = function() {
          gif.abort();
        };
        return promise;
      },


      exportWebmAnimation: function() {
        var deferred = $q.defer(), promise = deferred.promise, encoder, aborted = false;

        Modernizr.load({
          test: window.Whammy,
          nope: 'bower_components/whammy/whammy.js',
          complete: function() {
            var size = {width: depthy.exportSize, height: depthy.exportSize},
                duration = viewer.animateDuration,
                fps = Math.min(30),
                frames = Math.max(4, Math.round(duration * fps)),
                viewerObj = depthy.getViewer(),
                oldOptions = viewerObj.getOptions();

            encoder = new Whammy.Video(fps, 0.9);
            console.log('FPS %d Frames %d Scale %d Size %d Duration %d', fps, frames, viewer.depthScale, depthy.exportSize, duration);

            promise.finally(function() {
              oldOptions.pauseRender = false;
              viewerObj.setOptions(oldOptions);
            });

            var frame = 0;
            function worker() {
              if (aborted) {
                encoder = null;
                return;
              }
              try {
                if (frame < frames) {
                  deferred.notify(frame/frames);
                  viewerObj.setOptions({
                    size: size,
                    animate: true,
                    fit: false,
                    animatePosition: frame / frames,
                    quality: 5,
                    // make it 8, so it converts nicely to other video formats...
                    sizeDivisible: 8,
                    pauseRender: true,
                  });
                  viewerObj.render(true);
                  encoder.add(viewerObj.getCanvas());
                  ++frame;
                  // wait every 4 frames
                  if (frame % 4 === 0) {
                    setTimeout(worker, 0);
                  } else {
                    worker();
                  }
                } else {
                  var blob = encoder.compile();
                  deferred.resolve(blob);
                  depthy.viewer.overrideStageSize = null;
                  $rootScope.$safeApply();
                }
              } catch (e) {
                deferred.reject(e);
              }
            }
            setTimeout(worker, 0);

          }
        });
        promise.abort = function() {
          aborted = true;
        };
        return promise;
      },


      animateOption: function(obj, option, duration) {
        $(obj).animate(option, {
          duration: duration || 250,
          step: function() {$rootScope.$safeApply();},
          complete: function() {
            _.extend(obj, option);
            $rootScope.$safeApply();
          }
        });
      },


      isLeftpaneOpened: function() {
        return this.leftpaneOpened || this.isFullLayout();
      },

      leftpaneToggle: function() {
        if (depthy.leftpaneOpened) {
          depthy.leftpaneClose();
        } else {
          depthy.leftpaneOpen();
        }
      },

      leftpaneOpen: function(gallery) {
        gallery = false;
        depthy.zenMode = false;
        if (this.isFullLayout()) return;
        
        if (!gallery && depthy.leftpaneOpen !== true && !leftpaneDeferred) {
          if (depthy.activePopup) depthy.activePopup.reject();

          leftpaneDeferred = StateModal.stateDeferred(true);
          leftpaneDeferred.promise.finally(function() {
            if (depthy.leftpaneOpened === true) depthy.leftpaneOpened = false;
            leftpaneDeferred = null;
          });
        }
        depthy.leftpaneOpened = gallery ? 'gallery' : true;
      },

      leftpaneClose: function() {
        if (this.isFullLayout()) return;
        if (leftpaneDeferred) {
          if (depthy.leftpaneOpened === true) {
            leftpaneDeferred.reject();
          }
          leftpaneDeferred = null;
        }
        depthy.leftpaneOpened = false;
      },

      openPopup: function(state, options) {
        depthy.leftpaneClose();
        depthy.activePopup = StateModal.stateDeferred(true, options);
        depthy.activePopup.state = state;
        depthy.activePopup.promise.finally(function() {
          if (depthy.activePopup.state === state) depthy.activePopup = null;
        });
        return depthy.activePopup;
      },

      zenModeToggle: function() {
        if (depthy.leftpaneOpened !== 'gallery') depthy.leftpaneClose();
        if (!depthy.isReady() || !depthy.hasCompleteImage()) {
          depthy.zenMode = false;
          return;
        }
        depthy.zenMode = !depthy.zenMode;
      },

      drawModeEnable: function() {
        if (depthy.drawMode) return;
        depthy.leftpaneClose();
        depthy.zenMode = true;
        depthy.drawMode = new DepthyDrawer(depthy.getViewer());
        // depthy.drawMode.oldOptions = angular.extend({}, depthy.viewer);
        depthy.isViewerOverriden(true);
        $timeout(function() {$($window).resize();});
      },

      drawModeDisable: function() {
        if (!depthy.drawMode) return;
        depthy.zenMode = false;
        depthy.isViewerOverriden(false);
        // depthy.extend(depthy.viewer, depthy.drawMode.oldOptions);
        depthy.drawMode.destroy();
        depthy.drawMode = false;
        $timeout(function() {$($window).resize();});
      },


      reload: function() {
        $window.location.reload();
      },

      enableDebug: function() {
        depthy.debug = true;
        Modernizr.load({
          test: window.Stats,
          nope: 'bower_components/stats.js/build/stats.min.js',
          complete: function() {
            depthy.getViewer().enableDebug();
          }
        });
      },


    };

    myfn.close = function() {
      depthy.leftpaneClose();
    };

    initialize();


    return depthy;
  };
});



'use strict';

angular.module('depthyApp')
.controller('MainCtrl', function ($rootScope, $window, $scope, $timeout, ga, depthy, $element, $modal, $state, StateModal) {

  $rootScope.depthy = depthy;
  $rootScope.viewer = depthy.viewer; // shortcut
  $rootScope.Modernizr = window.Modernizr;
  $rootScope.Math = window.Math;
  $rootScope.screenfull = screenfull;

  $scope.version = depthy.getVersion();

  ga('set', 'dimension1', (Modernizr.webgl ? 'webgl' : 'no-webgl') + ' ' + (Modernizr.webp ? 'webp' : 'no-webp'));

  $rootScope.$safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase === '$apply' || phase === '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  $scope.loadSample = function(name) {
    $state.go('sample', {id: name});
    // depthy.leftpaneOpen(true);
  };

  $scope.openImage = function(image) {
    $state.go(image.state, image.stateParams);
    // depthy.leftpaneOpen(true);
  };



  $scope.$watch('compoundFiles', function(files) {
    if (files && files.length) {
      depthy.loadLocalImage(files[0]).then(
        function() {
          ga('send', 'event', 'image', 'parsed', depthy.hasDepthmap() ? 'depthmap' : 'no-depthmap');
          depthy.leftpaneClose();
          depthy.opened.openState();
        },
        function(e) {
          ga('send', 'event', 'image', 'error', e);
          depthy.leftpaneClose();
        }
      );
      // depthy.handleCompoundFile(files[0]);
    }
  });


  $scope.$watch('depthy.useOriginalImage', function() {
    depthy.refreshOpenedImage();
  });


  $scope.imageOptions = function() {
    depthy.openPopup('image.options');
  };

  $scope.shareOptions = function() {
    depthy.openPopup('share.options');
  };

  $scope.imageInfo = function() {
    StateModal.showModal('image.info', {
      templateUrl: 'views/image-info-modal.html',
      windowClass: 'info-modal',
      controller: 'ImageInfoModalCtrl',
    });
  };

  $scope.exportAnimationOptions = function(type) {
    var oldAnimate = depthy.viewer.animate;
    depthy.viewer.animate = true;
    
    if (type === 'gif') {
      depthy.exportSize = Math.min(500, depthy.exportSize);
    }
    
    depthy.openPopup('export.' + type + '.options').promise.finally(function() {
      depthy.viewer.animate = oldAnimate;
    });

  };

  $scope.exportAnimationRun = function(type) {
    depthy.exportActive = true;
    StateModal.showModal('export.' + type + '.run', {
      // stateOptions: {location: 'replace'},
      templateUrl: 'views/export-' + type + '-modal.html',
      controller: 'Export' + type.substr(0,1).toUpperCase() + type.substr(1) + 'ModalCtrl',
      // backdrop: 'static',
      windowClass: 'export-' + type + '-modal',
    }).result.finally(function() {
      depthy.exportActive = false;
    });
  };

  $scope.exportPngRun = function() {
    StateModal.showModal('export.png', {
      // stateOptions: {location: 'replace'},
      templateUrl: 'views/export-png-modal.html',
      controller: 'ExportPngModalCtrl',
      windowClass: 'export-png-modal',
    }).result.finally(function() {
    });
  };

  $scope.exportJpgRun = function() {
    StateModal.showModal('export.jpg', {
      // stateOptions: {location: 'replace'},
      templateUrl: 'views/export-jpg-modal.html',
      controller: 'ExportJpgModalCtrl',
      windowClass: 'export-jpg-modal',
    }).result.finally(function() {
    });
  };

  $scope.exportAnaglyphRun = function() {
    StateModal.showModal('export.anaglyph', {
      // stateOptions: {location: 'replace'},
      templateUrl: 'views/export-anaglyph-modal.html',
      controller: 'ExportAnaglyphModalCtrl',
      windowClass: 'export-anaglyph-modal modal-lg',
    }).result.finally(function() {
    });
  };

  $scope.sharePngRun = function() {
    StateModal.showModal('share.png', {
      // stateOptions: {location: 'replace'},
      templateUrl: 'views/share-png-modal.html',
      controller: 'SharePngModalCtrl',
      // backdrop: 'static',
      // keyboard: false,
      windowClass: 'share-png-modal',
    }).result.finally(function() {
    });
  };

  $scope.drawDepthmap = function() {
    $state.go('draw');
  };

  $scope.debugClicksLeft = 2;
  $scope.debugClicked = function() {
    if (--$scope.debugClicksLeft === 0) depthy.enableDebug();
  };

  $scope.$watch('(depthy.activePopup.state === "export.gif.options" || depthy.activePopup.state === "export.webm.options" || depthy.exportActive) && depthy.exportSize', function(size) {
    if (size) {
      depthy.isViewerOverriden(true);
      depthy.viewer.size = {width: size, height: size};
      if (depthy.viewer.fit) $scope.oldFit = depthy.viewer.fit;
      depthy.viewer.fit = false;
      console.log('Store fit ' + $scope.oldFit)
    } else {
      if ($scope.oldFit) {
        depthy.viewer.fit = $scope.oldFit;
        console.log('Restore fit ' + $scope.oldFit)
      }
      $($window).resize();
      depthy.isViewerOverriden(false);
    }
  });

  $scope.$watch('viewer.fit', function(fit) {
    if (fit === 'cover') {
      depthy.viewer.upscale = 4;
    } else if (fit === 'contain') {
      depthy.viewer.upscale = 1;
    }
  });


  $scope.$on('pixi.webgl.init.exception', function(evt, exception) {
    console.error('WebGL Init Exception', exception);
    Modernizr.webgl = false;
    ga('send', 'event', 'webgl', 'exception', exception.toString(), {nonInteraction: 1});
  });

  $($window).on('resize', function() {
    var $viewer = $('#viewer');
    depthy.viewer.size = {
      width:  $viewer.width(),
      height: $viewer.height(),
    };
    console.log('Resize %dx%d', $viewer.width(), $viewer.height());
    $scope.$safeApply();
  });
  $($window).resize();

  $($window).on('online offline', function() {
    $scope.$safeApply();
  });

  $timeout(function() {
    $scope.scroll = new IScroll('#leftpane', {
      mouseWheel: true,
      scrollbars: 'custom',
      click: false,
      fadeScrollbars: true,
      interactiveScrollbars: true,
      resizeScrollbars: false,
      eventPassthrough: 'horizontal',
    });
    // refresh on every digest...
    $scope.$watch(function() {
      setTimeout(function() {
        $scope.scroll.refresh();
      }, 100);
    });
  });




});
'use strict';

angular.module('depthyApp')
.controller('DrawCtrl', function ($scope, $element, depthy, $window, $timeout) {

  var drawer = depthy.drawMode,
      viewer = depthy.getViewer(),
      lastPointerPos = null,
      oldViewerOpts = angular.extend({}, depthy.viewer);
      
  drawer.setOptions(depthy.drawOptions || {
    depth: 0.5,
    size: 0.05,
    hardness: 0.5,
    opacity: 0.25,
  });

  angular.extend(depthy.viewer, {
    animate: false,
    fit: 'contain',
    upscale: 2,
    // depthPreview: 0.75,
    // orient: false,
    // hover: false,
  });

  $scope.drawer = drawer;
  $scope.drawOpts = drawer.getOptions();

  $scope.preview = 1;
  $scope.brushMode = false;

  $scope.$watch('drawOpts', function(options) {
    if (drawer && options) {
      drawer.setOptions(options);
    }
  }, true);

  $scope.$watch('preview', function(preview) {
    depthy.viewer.orient = preview === 2;
    depthy.viewer.hover = preview === 2;
    depthy.viewer.animate = preview === 2 && oldViewerOpts.animate;
    depthy.viewer.quality = preview === 2 ? false : 1;
    depthy.animateOption(depthy.viewer, {
      depthPreview: preview === 0 ? 1 : preview === 1 ? 0.75 : 0,
      depthScale: preview === 2 ? oldViewerOpts.depthScale : 0,
      depthBlurSize: preview === 2 ? oldViewerOpts.depthBlurSize : 0,
      enlarge: 1.0,
    }, 250);
  });

  $scope.togglePreview = function() {
    $scope.preview = ++$scope.preview % 3;
  };

  $scope.done = function() {
    $window.history.back();
  };

  $scope.cancel = function() {
    drawer.cancel();
    $window.history.back();
  };

  $scope.brushIcon = function() {
    switch($scope.brushMode) {
      case 'picker':
        return 'target';
      case 'level':
        return 'magnet';
      default:
        return 'draw';
    }
  };


  $element.on('touchstart mousedown', function(e) {
    var event = e.originalEvent,
        pointerEvent = event.touches ? event.touches[0] : event;

    if (event.target.id !== 'draw') return;

    lastPointerPos = viewer.screenToImagePos({x: pointerEvent.pageX, y: pointerEvent.pageY});

    if ($scope.brushMode === 'picker' || $scope.brushMode === 'level') {
      $scope.drawOpts.depth = drawer.getDepthAtPos(lastPointerPos);
      console.log('Picked %s', $scope.drawOpts.depth);
      if ($scope.brushMode === 'picker') {
        $scope.brushMode = false;
        lastPointerPos = null;
        $scope.$safeApply();
        event.preventDefault();
        event.stopPropagation();
        return;
      } else {
        $scope.$safeApply();
      }
    }

    drawer.drawBrush(lastPointerPos);
    event.preventDefault();
    event.stopPropagation();
  });

  $element.on('touchmove mousemove', function(e) {
    if (lastPointerPos) {
      var event = e.originalEvent,
          pointerEvent = event.touches ? event.touches[0] : event,
          pointerPos = viewer.screenToImagePos({x: pointerEvent.pageX, y: pointerEvent.pageY});

      drawer.drawBrushTo(pointerPos);

      lastPointerPos = pointerPos;
    }
  });

  $element.on('touchend mouseup', function(event) {
    // console.log(event);
    if (lastPointerPos) {
      lastPointerPos = null;
      $scope.$safeApply();
    }
  });

  function getSliderForKey(e) {
    var id = 'draw-brush-depth';
    if (e.shiftKey && e.altKey) {
      id = 'draw-brush-hardness';
    } else if (e.altKey) {
      id = 'draw-brush-opacity';
    } else if (e.shiftKey) {
      id = 'draw-brush-size';
    }
    var el = $element.find('.' + id + ' [range-stepper]');
    el.click(); // simulate click to notify change
    return el.controller('rangeStepper');
  }

  function onKeyDown(e) {
    var s, handled = false;
    console.log('keydown which %d shift %s alt %s ctrl %s', e.which, e.shiftKey, e.altKey, e.ctrlKey);
    if (e.which === 48) { // 0
      getSliderForKey(e).percent(0.5);
      handled = true;
    } else if (e.which >= 49 && e.which <= 57) { // 1-9
      getSliderForKey(e).percent((e.which - 49) / 8);
      handled = true;
    } else if (e.which === 189) { // -
      s = getSliderForKey(e);
      s.percent(s.percent() - 0.025);
      handled = true;
    } else if (e.which === 187) { // +
      s = getSliderForKey(e);
      s.percent(s.percent() + 0.025);
      handled = true;
    } else if (e.which === 32) {
      $element.find('.draw-preview').click();
      handled = true;
    } else if (e.which === 90) { // z
      $element.find('.draw-undo').click();
      handled = true;
    } else if (e.which === 80) { // p
      $element.find('.draw-picker').click();
      handled = true;
    } else if (e.which === 76) { // l
      $element.find('.draw-level').click();
      handled = true;
    }

    if (handled) {
      e.preventDefault();
      $scope.$safeApply();
    }

  }

  $($window).on('keydown', onKeyDown);

  $element.find('.draw-brush-depth').on('touchstart mousedown click', function() {
    $scope.brushMode = false;
  });

  $element.on('$destroy', function() {
    $element.off('touchstart mousedown');
    $element.off('touchmove mousemove');
    $($window).off('keydown', onKeyDown);

    depthy.animateOption(depthy.viewer, {
      depthPreview: oldViewerOpts.depthPreview,
      depthScale: oldViewerOpts.depthScale,
      depthBlurSize: oldViewerOpts.depthBlurSize,
      enlarge: oldViewerOpts.enlarge,
    }, 250);

    $timeout(function() {
      angular.extend(depthy.viewer, oldViewerOpts);
    }, 251);

    if (drawer.isCanceled()) {
      // restore opened depthmap
      viewer.setDepthmap(depthy.opened.depthSource, depthy.opened.depthUsesAlpha);
    } else {
      if (drawer.isModified()) {
        depthy.drawOptions = drawer.getOptions();

        // remember drawn depthmap
        // store it as jpg
        viewer.exportDepthmap().then(function(url) {
          depthy.opened.markAsModified();
          depthy.opened.depthSource = url; //viewer.getDepthmap().texture;
          depthy.opened.depthUsesAlpha = false;
          viewer.setDepthmap(url);
          depthy.opened.onDepthmapOpened();
        });
      }
    }

    drawer.destroy(true);

  });



});
'use strict';

angular.module('depthyApp')
.directive('fileselect', function ($parse) {
  return {
    restrict: 'A',
    scope: true,
    link: function postLink(scope, element, attrs) {

      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.style.visibility = 'hidden';
      fileInput.style.position = 'absolute';
      fileInput.style.left = '-9000px';

      element.append(fileInput);

      var onDrag = function(e) {
        e.stopPropagation();
        e.preventDefault();
      };

      var onDrop = function(e) {
        e.stopPropagation();
        e.preventDefault();

        console.log(e);

        var dt = e.originalEvent.dataTransfer;
        var files = dt.files;

        handleFiles(files);
        scope.$apply();
      };

      function handleFiles(files) {
        scope.$broadcast('fileselect', files);
        if (attrs.fileselect) {
          $parse(attrs.fileselect).assign(scope, files);
        }
      }

      scope.selectFile = function(e) {
        fileInput.click();
        if (e) e.preventDefault();
      };

      element.on('dragenter', onDrag);
      element.on('dragover', onDrag);
      element.on('drop', onDrop);
      fileInput.addEventListener('change', function() {
        handleFiles(_.filter(this.files));
        fileInput.value = '';
        scope.$apply();
      }, false);

    }
  };
});

'use strict';

angular.module('depthyApp')
.directive('pixi', function ($parse) {
  return {
    // template: '<canvas></canvas>',
    restrict: 'A',
    scope: false,
    controller: function postLink($scope, $element, $attrs) {

      var self = this,
          stageAttr = $parse($attrs.pixi),
          stage = stageAttr($scope),
          renderFunc = $scope.$eval($attrs.pixiRender);

      if (!stage) {
        // create a new instance of a pixi stage
        stage = new PIXI.Stage($scope.$eval($attrs.pixiBackground || '0'));
        stageAttr.assign($scope, stage);
      }
     
      var antialias = $scope.$eval($attrs.pixiAntialias || 'false'),
          transparent = $scope.$eval($attrs.pixiTransparent || 'false'),
          rendererType = $scope.$eval($attrs.pixiRenderer || 'auto'),
          renderer;
      // create a renderer instance.
      switch(rendererType) {
        case 'canvas':
          renderer = new PIXI.CanvasRenderer($element.width(), $element.height(), $element[0], transparent);
          break;
        case 'webgl':
          try {
            renderer = new PIXI.WebGLRenderer($element.width(), $element.height(), $element[0], transparent, antialias);
          } catch (e) {
            $scope.$emit('pixi.webgl.init.exception', e);
            return;
          }
          break;
        default:
          renderer = PIXI.autoDetectRenderer($element.width(), $element.height(), $element[0], antialias, transparent);
      }

      this.render = function render(force) {
     
        var doRender = true;
        if (renderFunc) doRender = renderFunc(stage, renderer);

        // render the stage   
        if (force || doRender !== false) renderer.render(stage);
      };

      function renderLoop() {
        self.render();
        requestAnimFrame( renderLoop );
      }

      requestAnimFrame( renderLoop );

      this.getStage = function() {
        return stage;
      };

      this.getRenderer = function() {
        return renderer;
      };

      this.getContext = function() {
        return renderer.gl ? renderer.gl : renderer.context;
      };


      // $($window).resize(function() {
      //     renderer.resize(element.width(), element.height())                
      // })

    }
  };
});

'use strict';

angular.module('depthyApp')
.directive('depthyViewer', function () {
  return {
    restrict: 'A',
    scope: true,
    controller: function($scope, $element, $attrs) {
      var viewer,
          options = $scope.$parent.$eval($attrs.depthyViewer);

      $scope.$parent.$watch($attrs.depthyViewer, function(newOptions) {
        if (viewer && newOptions) {
          viewer.setOptions(options);
        }
      }, true);

      viewer = new DepthyViewer($element[0], options);

      this.getViewer = function() {
        return viewer;
      };

    },
  };

});

/**
Angular ShareUrls

Based on https://github.com/bradvin/social-share-urls

Copyright 2014 Rafał Lindemann https://github.com/panrafal
*/
angular.module('shareUrls', [])
.provider('ShareUrls', function () {
  'use strict';

  var provider = this,
    templates = {
    facebook: {
      url: 'https://www.facebook.com/sharer.php?s=100&p[url]={url}&p[images][0]={img}&p[title]={title}&p[summary]={desc}'
    },
    'facebook-feed': {
      url: 'https://www.facebook.com/dialog/feed?app_id={app_id}&link={url}&picture={img}&name={title}&description={desc}&redirect_uri={redirect_url}'
    },
    'facebook-likebox': {
      // &width=50&height=80
      url: '//www.facebook.com/plugins/like.php?href={url}&colorscheme={scheme}&layout={layout}&action={action}&show_faces=false&send=false&appId=&locale={locale}'
    },
    twitter: {
      url: 'https://twitter.com/share?url={url}&text={title}&via={via}&hashtags={hashtags}'
    },
    'twitter-follow': {
      url: 'https://twitter.com/intent/user?screen_name={name}'
    },
    google: {
      url: 'https://plus.google.com/share?url={url}',
    },
    pinterest: {
      url: 'https://pinterest.com/pin/create/bookmarklet/?media={img}&url={url}&is_video={is_video}&description={title}',
    },
    linkedin: {
      url: 'https://www.linkedin.com/shareArticle?url={url}&title={title}',
    },
    buffer: {
      url: 'https://bufferapp.com/add?text={title}&url={url}',
    },
    digg: {
      url: 'https://digg.com/submit?url={url}&title={title}',
    },
    tumblr: {
      url: 'https://www.tumblr.com/share/link?url={url}&name={title}&description={desc}',
    },
    reddit: {
      url: 'https://reddit.com/submit?url={url}&title={title}',
    },
    stumbleupon: {
      url: 'https://www.stumbleupon.com/submit?url={url}&title={title}',
    },
    delicious: {
      url: 'https://delicious.com/save?v=5&provider={provider}&noui&jump=close&url={url}&title={title}',
    },
  };

  this.defaults = {
    popupWidth: 600,
    popupHeight: 300,
  };


  function generateUrl(url, opt) {
    var prop, arg, argNe;
    for (prop in opt) {
      arg = '{' + prop + '}';
      if  (url.indexOf(arg) !== -1) {
        url = url.replace(new RegExp(arg, 'g'), encodeURIComponent(opt[prop]));
      }
      argNe = '{' + prop + '-ne}';
      if  (url.indexOf(argNe) !== -1) {
        url = url.replace(new RegExp(argNe, 'g'), opt[prop]);
      }
    }
    return cleanUrl(url);
  }
  
  function cleanUrl(fullUrl) {
    //firstly, remove any expressions we may have left in the url
    fullUrl = fullUrl.replace(/\{([^{}]*)}/g, '');
    
    //then remove any empty parameters left in the url
    var params = fullUrl.match(/[^\=\&\?]+=[^\=\&\?]+/g),
      url = fullUrl.split('?')[0];
    if (params && params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return url;
  }


  this.$get = function($window, $location) {
    var ShareUrls = {
      defaults: angular.extend({url: $location.absUrl()}, provider.defaults),

      getUrl: function(type, opts) {
        var template = templates[type];
        if (!template) throw 'Unknown template ' + type;
        opts = angular.extend({}, template.defaults || {}, this.defaults || {}, opts || {});

        return generateUrl(template.url, opts);
      },

      openPopup: function(type, opts) {
        var template = templates[type];
        if (!template) throw 'Unknown template ' + type;
        opts = angular.extend({}, template.defaults || {}, this.defaults || {}, opts || {});


        var width = opts.popupWidth || 800,
            height = opts.popupHeight || 500,
            px = Math.floor(((screen.availWidth || 1024) - width) / 2),
            py = Math.floor(((screen.availHeight || 700) - height) / 2),
            url = generateUrl(template.url, opts);
     
        // open popup
        var popup = $window.open(url, 'social',
          'width=' + width + ',height=' + height +
          ',left=' + px + ',top=' + py +
          ',location=0,menubar=0,toolbar=0,status=0,scrollbars=1,resizable=1');
          
        if (popup) {
          popup.focus();
        }
     
        return !!popup;
      }

    };

    return ShareUrls;
  };
})
.directive('sharePopup', function (ShareUrls) {
  'use strict';
  return {
    restrict: 'A',
    link: function postLink($scope, $element, $attrs) {

      $element.on('click', function(e) {
        ShareUrls.openPopup($attrs.sharePopup, $attrs.shareOptions ? $scope.$eval($attrs.shareOptions) : {});
        e.preventDefault();
      });

    }
  };
});


'use strict';

angular.module('depthyApp')
.directive('rangeStepper', function ($parse, $timeout, $compile) {
  return {
    restrict: 'A',
    scope: true,
    require: ['rangeStepper', 'ngModel'],
    // template: '<div ng-transclude></div>',
    // transclude: true,
    controller: function() {
    },
    compile: function($element, $attrs) {
      // console.log($element);
      var labelTemplate;
      if (!$element.find('.rs-value, .rs-thumb').length) {
        labelTemplate = $element.html();
        $element.html('');
      }
      return function postLink($scope, $element, $attrs, ctrls) {
        var values = $scope.$parent.$eval($attrs.values),
            options,
            position, defaultFormatter,
            rangeStepper = ctrls[0],
            ngModel = ctrls[1];

        options = angular.extend({
          // snap to defined values - 0.0 - 1.0
          snap: 0.1,
          // step between defined values - 0.0 - 1.0
          step: 0,
          // interpolated values will have this precision
          precision: 0.001,
          labelTemplate: labelTemplate || '{{getLabel(v)}}',
          valuesTemplate: '<div ng-repeat="v in values" class="rs-value"><placeholder /></div>',
          thumbTemplate: '<div class="rs-thumb"><placeholder /></div>',
          format: 0.1,
          units: '',
        }, $scope.$parent.$eval($attrs.rangeStepper) || {});

        if (angular.isFunction(options.format)) {
          defaultFormatter = options.format;
        } else if (angular.isNumber(options.format)) {
          var precision = options.format;
          defaultFormatter = function(v) {
            return precise(v, precision);
          };
        } else if (options.format === '%') {
          defaultFormatter = function(v) {return Math.round(v * 100);};
        // } else if (angular.isString(options.format)) {
          // defaultFormatter = $format(options.format);
        } else {
          defaultFormatter = function(v) {return v;};
        }

        if (!values || values.length < 2) {
          console.error('Values are missing! Expr: %s, evaled to %o', $attrs.values, values);
        }

        function initialize() {
          // setup templates
          if ($element.find('.rs-value').length === 0) {
            $element.append($compile(options.valuesTemplate.replace(/<placeholder\s*\/>/i, options.labelTemplate))($scope));
          }
          if ($element.find('.rs-thumb').length === 0) {
            $element.append($compile(options.thumbTemplate.replace(/<placeholder\s*\/>/i, options.labelTemplate))($scope));
          }
          $timeout(updateValues);
        }

        function precise(v, precision) {
          if (!precision) return v;
          return +(Math.round(v / precision) * precision).toFixed(8);
        }

        function pxToPosition(px) {
          var rect = $element[0].getBoundingClientRect();
          return (px - rect.left) / rect.width * (values.length);
        }

        function positionClamp(pos) {
          return Math.max(0, Math.min( values.length - 1, (pos >> 0) + precise(pos % 1, options.step) ));
        }

        function getValueAt(i) {
          var v = values[Math.max(0, Math.min(values.length - 1, Math.round(i)))];
          return angular.isObject(v) ? v.value : v;
        }

        function getValue(v) {
          return angular.isObject(v) && v.value !== undefined ? v.value : v;
        }

        function getLabel(v, format, units) {
          if (angular.isObject(v)) {
            if (v.label !== undefined) return v.label;
            v = v.value;
          }

          return (format || defaultFormatter)(v) + (units || options.units);
        }

        function interpolate(a, b, t) {
          if (angular.isObject(a)) {
            var result = {};
            for (var k in a) {
              result[k] = interpolate(a[k], b[k], t);
            }
            return result;
          } else {
            return precise(a + (b - a) * t, options.precision);
          }
        }

        function locate(v, a, b) {
          if (angular.isObject(v)) {
            var result = true;
            for (var k in v) {
              var pos = locate(v[k], a[k], b[k]);
              if (pos === false) return false;
              else if (pos !== true) {
                if (result === true || Math.abs(result - pos) < 0.01) {
                  result = pos;
                } else {
                  // console.warn('Partial range!');
                  return false;
                }
              }
            }
            return result;
          } else if (a === b) {
            return v === a;
          } else if (v === a) {
            return 0;
          } else if (v === b) {
            return 1;
          } else {
            return (v - a) / (b - a);
          }
        }

        function equals(a, b) {
          return locate(a, b, b) === true;
        }

        function positionToValue(pos) {
          pos = positionClamp(pos);
          if (options.snap && Math.abs(pos - Math.round(pos)) <= options.snap / 2) pos = Math.round(pos);
          if (pos % 1 === 0) return values[pos];

          var value = getValueAt(Math.floor(pos)),
              next = getValueAt(Math.floor(pos) + 1);
          return {value: interpolate(value, next, pos % 1)};
        }

        function valueToPosition(v) {
          var i = values.indexOf(v);
          if (i >= 0) return i;
          v = getValue(v);
          for (i = 0; i < values.length - 1; ++i) {
            var from = getValueAt(i),
                to = getValueAt(i + 1),
                pos = locate(v, from, to);
            if (pos !== false && pos !== true && pos >= 0 && pos <= 1) {
              return i + pos;
            }
          }
          if (v >= getValueAt(values.length - 1)) return values.length - 1;
          // console.warn('Value %s is out of bounds!', v);
          return false;
        }

        function updateValues() {
          $element.find('.rs-value, .rs-thumb').css('width', (1 / values.length * 100) + '%');
        }

        function setPosition(pos) {
          position = positionClamp(pos);
          $scope.position = position;

          $element.find('.rs-thumb').css('transform', 'translateX('+(position * 100)+'%)');

          if (pos === false) {
            $scope.v = ngModel.$viewValue;
            return;
          }

          var value = positionToValue(position),
              valueValue = getValue(value);

          $scope.v = value;
          // console.log('setPosition pos %s (%s) value %o getValue %o', pos, position, value, valueValue);
          if (!equals(ngModel.$viewValue, valueValue)) {
            ngModel.$setViewValue(valueValue);
          }
        }

        $scope.dragging = false;
        $scope.values = values;

        $scope.getLabel = getLabel;
        $scope.getValue = getValue;

        ngModel.$render = function() {
          setPosition(valueToPosition(ngModel.$viewValue));
        };

        $element.on('mousedown touchstart', '.rs-value', function(event) {
          var pointer = event.originalEvent.touches && event.originalEvent.touches[0] || event;
          if (event.touches && event.touches.length > 1) return;

          event.preventDefault();
          // console.log(event);

          setPosition(Math.floor(positionClamp( pxToPosition(pointer.pageX) )));
          $scope.$apply();
        });

        $element.on('mousedown touchstart', '.rs-thumb', function(event) {
          var pointer = event.originalEvent.touches && event.originalEvent.touches[0] || event;
          if (event.touches && event.touches.length > 1) return;

          event.preventDefault();
          if ($scope.dragging) return;

          $scope.dragging = true;
          $element.addClass('rs-dragging');
          var dragPos = pxToPosition(pointer.pageX),
              onMove = function(event) {
                var pointer = event.originalEvent.touches && event.originalEvent.touches[0] || event;
                event.preventDefault();
                var newPos = pxToPosition(pointer.pageX);
                setPosition( positionClamp( position + newPos - dragPos ));
                dragPos = newPos;
                $scope.$apply();
              },
              onEnd = function(event) {
                event.preventDefault();
                $scope.dragging = false;
                $element.removeClass('rs-dragging');
                $('body').off('mousemove touchmove', onMove)
                  .off('mouseup touchend', onEnd);
                $timeout(function() {
                  setPosition( valueToPosition(positionToValue(position)) );
                });
                $scope.$apply();
              };

          $('body').on('mousemove touchmove', onMove)
            .on('mouseup touchend', onEnd);

        });

        // setup API
        rangeStepper.percent = function(p) {
          if (p !== undefined) {
            setPosition(p * (values.length - 1));
          }
          return position / (values.length - 1);
        };


        initialize();

      };
    }
  };
});

/**
 * @author Mat Groves https://matgroves.com/ @Doormat23
 */

/**
 *
 * The ColorMatrixFilter2 class lets you apply a 4x4 matrix transformation on the RGBA
 * color and alpha values of every pixel on your displayObject to produce a result
 * with a new set of RGBA color and alpha values. Its pretty powerful!
 * @class ColorMatrixFilter
 * @contructor
 */
PIXI.ColorMatrixFilter2 = function()
{
  'use strict';
  PIXI.AbstractFilter.call( this );

  this.passes = [this];

  // set the uniforms
  this.uniforms = {
    matrix: {type: 'mat4', value: [1,0,0,0,
                                   0,1,0,0,
                                   0,0,1,0,
                                   0,0,0,1]},
    shift: {type: '4fv', value:  [0.0,0.0,0.0,0.0]},
  };

  this.fragmentSrc = [
    'precision mediump float;',
    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',
    'uniform float invert;',
    'uniform mat4 matrix;',
    'uniform vec4 shift;',
    'uniform sampler2D uSampler;',

    'void main(void) {',
    '   gl_FragColor = texture2D(uSampler, vTextureCoord) * matrix + shift;',
    //  '   gl_FragColor = gl_FragColor;',
    '}'
  ];
};

PIXI.ColorMatrixFilter2.prototype = Object.create( PIXI.AbstractFilter.prototype );
PIXI.ColorMatrixFilter2.prototype.constructor = PIXI.ColorMatrixFilter2;

/**
 * Sets the matrix of the color matrix filter
 *
 * @property matrix
 * @type Array and array of 16 numbers
 * @default [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
 */
Object.defineProperty(PIXI.ColorMatrixFilter2.prototype, 'matrix', {
  get: function() {
    return this.uniforms.matrix.value;
  },
  set: function(value) {
    this.uniforms.matrix.value = value;
  }
});

/**
 * Sets the constant channel shift
 *
 * @property shift
 * @type Array and array of 26 numbers
 * @default [0,0,0,0]
 */
Object.defineProperty(PIXI.ColorMatrixFilter2.prototype, 'shift', {
  get: function() {
    return this.uniforms.shift.value;
  },
  set: function(value) {
    this.uniforms.shift.value = value;
  }
});
/**
 *
 * The DepthDisplacementFilter class uses the pixel values from the specified texture (called the displacement map) to perform a displacement of an object.
 * You can use this filter to apply all manor of crazy warping effects
 * Currently the r property of the texture is used offset the x and the g propery of the texture is used to offset the y.
 * @class DepthDisplacementFilter
 * @contructor
 * @param texture {Texture} The texture used for the displacemtent map * must be power of 2 texture at the moment
 */
'use strict';
PIXI.DepthDisplacementFilter = function(texture)
{
  PIXI.AbstractFilter.call( this );
 
  this.passes = [this];
  // texture.baseTexture._powerOf2 = true;
 
  // set the uniforms
  this.uniforms = {
    displacementMap: {type: 'sampler2D', value:texture},
    scale:           {type: '1f', value:0.015},
    offset:          {type: '2f', value:{x:0, y:0}},
    mapDimensions:   {type: '2f', value:{x:1, y:5112}},
    dimensions:      {type: '4fv', value:[0,0,0,0]},
    focus:           {type: '1f', value:0.5}
  };
 
  if(texture.baseTexture.hasLoaded)
  {
    this.uniforms.mapDimensions.value.x = texture.width;
    this.uniforms.mapDimensions.value.y = texture.height;
  }
  else
  {
    this.boundLoadedFunction = this.onTextureLoaded.bind(this);
 
    texture.baseTexture.on('loaded', this.boundLoadedFunction);
  }
 
  this.fragmentSrc = [
    'precision mediump float;',
    'varying vec2 vTextureCoord;',
    'varying vec4 vColor;',
    'uniform sampler2D displacementMap;',
    'uniform sampler2D uSampler;',
    'uniform float scale;',
    'uniform vec2 offset;',
    'uniform vec4 dimensions;',
    'uniform vec2 mapDimensions;',
    'uniform float focus;',
 
    'void main(void) {',
    '   float aspect = dimensions.x / dimensions.y;',
    '   vec2 scale2 = vec2(scale * min(1.0, 1.0 / aspect), scale * min(1.0, aspect)) * vec2(1, -1) * vec2(1);',
    '   vec2 mapCords = vTextureCoord;',
    '   mapCords.y *= -1.0;',
    '   mapCords.y += 1.0;',
    '   float map = texture2D(displacementMap, mapCords).r;',
    '   map = map * -1.0 + focus;',
    '   vec2 disCords = vTextureCoord;',
    '   disCords += offset * map * scale2;',
    '   gl_FragColor = texture2D(uSampler, disCords) * vColor;',
    // '   gl_FragColor = vec4(1,1,1,0.5);',
    // '   gl_FragColor *= texture2D(displacementMap, mapCords);',
    '}'
  ];
};
 
PIXI.DepthDisplacementFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
PIXI.DepthDisplacementFilter.prototype.constructor = PIXI.DepthDisplacementFilter;
 
PIXI.DepthDisplacementFilter.prototype.onTextureLoaded = function()
{
  this.uniforms.mapDimensions.value.x = this.uniforms.displacementMap.value.width;
  this.uniforms.mapDimensions.value.y = this.uniforms.displacementMap.value.height;
 
  this.uniforms.displacementMap.value.baseTexture.off('loaded', this.boundLoadedFunction);
};
 
/**
 * The texture used for the displacemtent map * must be power of 2 texture at the moment
 *
 * @property map
 * @type Texture
 */
Object.defineProperty(PIXI.DepthDisplacementFilter.prototype, 'map', {
  get: function() {
    return this.uniforms.displacementMap.value;
  },
  set: function(value) {
    this.uniforms.displacementMap.value = value;
  }
});
 
/**
 * The multiplier used to scale the displacement result from the map calculation.
 *
 * @property scale
 * @type Point
 */
Object.defineProperty(PIXI.DepthDisplacementFilter.prototype, 'scale', {
  get: function() {
    return this.uniforms.scale.value;
  },
  set: function(value) {
    this.uniforms.scale.value = value;
  }
});
 
/**
 * Focus point in paralax
 *
 * @property focus
 * @type float
 */
Object.defineProperty(PIXI.DepthDisplacementFilter.prototype, 'focus', {
  get: function() {
    return this.uniforms.focus.value;
  },
  set: function(value) {
    this.uniforms.focus.value = Math.min(1,Math.max(0,value));
  }
});

/**
 * The offset used to move the displacement map.
 *
 * @property offset
 * @type Point
 */
Object.defineProperty(PIXI.DepthDisplacementFilter.prototype, 'offset', {
  get: function() {
    return this.uniforms.offset.value;
  },
  set: function(value) {
    this.uniforms.offset.value = value;
  }
});
/**

  Experimental shader giving perspective effect on image with depthmap.

  Quality is controlled by defined profiles 1, 2 and 3.

  ---------------
  The MIT License

  Copyright (c) 2014 Rafał Lindemann. https://panrafal.github.com/depthy

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.

 */
'use strict';
PIXI.DepthPerspectiveFilter = function(texture, quality)
{
  PIXI.AbstractFilter.call( this );
 
  this.passes = [this];

  // set the uniforms
  this.uniforms = {
    displacementMap: {type: 'sampler2D', value:texture},
    scale:           {type: '1f', value:0.015},
    offset:          {type: '2f', value:{x:0, y:0}},
    mapDimensions:   {type: '2f', value:{x:1, y:5112}},
    dimensions:      {type: '4fv', value:[0,0,0,0]},
    focus:           {type: '1f', value:0.5},
    enlarge:         {type: '1f', value:1.06}
  };
 
  if(texture.baseTexture.hasLoaded)
  {
    this.uniforms.mapDimensions.value.x = texture.width;
    this.uniforms.mapDimensions.value.y = texture.height;
  }
  else
  {
    this.boundLoadedFunction = this.onTextureLoaded.bind(this);
 
    texture.baseTexture.on('loaded', this.boundLoadedFunction);
  }
 
  this.fragmentSrc = [


'// Copyright (c) 2014 Rafał Lindemann. https://panrafal.github.com/depthy',
'precision mediump float;',
'',
'varying vec2 vTextureCoord;',
'varying vec4 vColor;',
'uniform sampler2D displacementMap;',
'uniform sampler2D uSampler;',
'uniform vec4 dimensions;',
'uniform vec2 mapDimensions;',
'uniform float scale;',
'uniform vec2 offset;',
'uniform float focus;',
'uniform float enlarge;',
'',
'#if !defined(QUALITY)',
'',
'  #define METHOD 1',
'  #define CORRECT',
'//     #define COLORAVG',
'  #define UPSCALE 1.5',
'  #define ANTIALIAS 1',
'  #define AA_TRIGGER 0.8',
'  #define AA_POWER 1.0',
'  #define AA_MAXITER 8.0',
'  #define MAXSTEPS 16.0',
'  #define CONFIDENCE_MAX 2.5',
'',
'#elif QUALITY == 2',
'',
'  #define METHOD 1',
'  #define CORRECT',
'//     #define COLORAVG',
'  #define MAXSTEPS 4.0',
'  #define UPSCALE 0.8',
'//   #define ANTIALIAS 2',
'  #define CONFIDENCE_MAX 2.5',
'',
'#elif QUALITY == 3',
'',
'  #define METHOD 1',
'  #define CORRECT',
'//     #define COLORAVG',
'  #define MAXSTEPS 6.0',
'  #define UPSCALE 1.0',
'  #define ANTIALIAS 2',
'  #define CONFIDENCE_MAX 2.5',
'',
'#elif QUALITY == 4',
'',
'  #define METHOD 1',
'  #define CORRECT',
'//     #define COLORAVG',
'  #define MAXSTEPS 16.0',
'  #define UPSCALE 1.5',
'  #define ANTIALIAS 2',
'  #define CONFIDENCE_MAX 2.5',
'',
'#elif QUALITY == 5',
'',
'  #define METHOD 1',
'  #define CORRECT',
'  #define COLORAVG',
'  #define MAXSTEPS 40.0',
'  #define UPSCALE 1.5',
'//     #define ANTIALIAS 2',
'  #define AA_TRIGGER 0.8',
'  #define AA_POWER 1.0',
'  #define AA_MAXITER 8.0',
'  #define CONFIDENCE_MAX 4.5',
'',
'#endif',
'',
'',
'#define BRANCHLOOP  ',
'#define BRANCHSAMPLE ',
'#define DEBUG 0',
'//#define DEBUGBREAK 4',
'',
'#ifndef METHOD',
'  #define METHOD 1',
'#endif',
'#ifndef MAXSTEPS',
'  #define MAXSTEPS 8.0',
'#endif',
'#ifndef UPSCALE',
'  #define UPSCALE 1.2',
'#endif',
'#ifndef PERSPECTIVE',
'  #define PERSPECTIVE 0.0',
'#endif',
'#ifndef UPSCALE',
'  #define UPSCALE 1.06',
'#endif',
'#ifndef CONFIDENCE_MAX',
'  #define CONFIDENCE_MAX 0.2',
'#endif',
'#ifndef COMPRESSION',
'  #define COMPRESSION 0.8',
'#endif',
'',
'const float perspective = PERSPECTIVE;',
'// float steps = clamp( ceil( max(abs(offset.x), abs(offset.y)) * maxSteps ), 1.0, maxSteps);',
'float steps = MAXSTEPS;',
'',
'#ifdef COLORAVG',
'float maskPower = steps * 2.0;// 32.0;',
'#else ',
'float maskPower = steps * 1.0;// 32.0;',
'#endif',
'float correctPower = 1.0;//max(1.0, steps / 8.0);',
'',
'const float compression = COMPRESSION;',
'const float dmin = (1.0 - compression) / 2.0;',
'const float dmax = (1.0 + compression) / 2.0;',
'',
'const float vectorCutoff = 0.0 + dmin - 0.0001;',
'',
'float aspect = dimensions.x / dimensions.y;',
'vec2 scale2 = vec2(scale * min(1.0, 1.0 / aspect), scale * min(1.0, aspect)) * vec2(1, -1) * vec2(UPSCALE);',
'// mat2 baseVector = mat2(vec2(-focus * offset) * scale2, vec2(offset - focus * offset) * scale2);',
'mat2 baseVector = mat2(vec2((0.5 - focus) * offset - offset/2.0) * scale2, ',
'                       vec2((0.5 - focus) * offset + offset/2.0) * scale2);',
'',
'',
'void main(void) {',
'',
'  vec2 pos = (vTextureCoord - vec2(0.5)) / vec2(enlarge) + vec2(0.5);',
'  mat2 vector = baseVector;',
'  // perspective shift',
'  vector[1] += (vec2(2.0) * pos - vec2(1.0)) * vec2(perspective);',
'  ',
'  float dstep = compression / (steps - 1.0);',
'  vec2 vstep = (vector[1] - vector[0]) / vec2((steps - 1.0)) ;',
'  ',
'  #ifdef COLORAVG',
'    vec4 colSum = vec4(0.0);',
'  #else',
'    vec2 posSum = vec2(0.0);',
'  #endif',
'',
'  float confidenceSum = 0.0;',
'  float minConfidence = dstep / 2.0;',
'    ',
'  #ifdef ANTIALIAS',
'    #ifndef AA_TRIGGER',
'      #define AA_TRIGGER 0.8',
'    #endif',
'    #if ANTIALIAS == 11 || ANTIALIAS == 12',
'      #ifndef AA_POWER',
'        #define AA_POWER 0.5',
'      #endif',
'      #ifndef AA_MAXITER',
'        #define AA_MAXITER 16.0',
'      #endif',
'      float loopStep = 1.0;',
'    #endif',
'    ',
'    #define LOOP_INDEX j',
'    float j = 0.0;',
'  #endif',
'',
'  #ifndef LOOP_INDEX',
'    #define LOOP_INDEX i',
'  #endif',
'',
'',
'  for(float i = 0.0; i < MAXSTEPS; ++i) {',
'    vec2 vpos = pos + vector[1] - LOOP_INDEX * vstep;',
'    float dpos = 0.5 + compression / 2.0 - LOOP_INDEX * dstep;',
'    #ifdef BRANCHLOOP',
'    if (dpos >= vectorCutoff && confidenceSum < CONFIDENCE_MAX) {',
'    #endif',
'      float depth = 1.0 - texture2D(displacementMap, vpos * vec2(1, -1) + vec2(0, 1)).r;',
'      depth = clamp(depth, dmin + 0.001, dmax); // add 0.001 for htc one+meth 1',
'      float confidence;',
'',
'      #if METHOD == 1',
'        confidence = step(dpos, depth);',
'',
'      #elif METHOD == 3',
'        confidence = 1.0 - abs(dpos - depth);',
'        if (confidence < 1.0 - minConfidence * 2.0) confidence = 0.0;',
'',
'      #elif METHOD == 5',
'        confidence = 1.0 - abs(dpos - depth);',
'        confidence = pow(confidence, maskPower);',
'',
'      #endif',
'',
'      #ifndef BRANCHLOOP',
'       confidence *= step(vectorCutoff, dpos);',
'       confidence *= step(confidenceSum, CONFIDENCE_MAX);',
'      #endif',
'',
'      #ifdef ANTIALIAS',
'        #if ANTIALIAS == 1 // go back halfstep, go forward fullstep - branched',
'',
'          if (confidence > AA_TRIGGER && i == j) {',
'            j -= 0.5;',
'          } else {',
'            j += 1.0;',
'          }',
'          // confidence *= CONFIDENCE_MAX / 3.0;',
'',
'        #elif ANTIALIAS == 2 // go back halfstep, go forward fullstep - mult',
'          j += 1.0 + step(AA_TRIGGER, confidence) ',
'               * step(i, j) * -1.5; ',
'          // confidence *= CONFIDENCE_MAX / 3.0;',
'',
'        #elif ANTIALIAS == 11',
'          if (confidence >= AA_TRIGGER && i == j && steps - i > 1.0) {',
'            loopStep = AA_POWER * 2.0 / min(AA_MAXITER, steps - i - 1.0);',
'            j -= AA_POWER + loopStep;',
'          }',
'          confidence *= loopStep;',
'          j += loopStep;',
'        #elif ANTIALIAS == 12',
'          float _if_aa = step(AA_TRIGGER, confidence)',
'                       * step(i, j)',
'                       * step(1.5, steps - i);',
'          loopStep = _if_aa * (AA_POWER * 2.0 / min(AA_MAXITER, max(0.1, steps - i - 1.0)) - 1.0) + 1.0;',
'          confidence *= loopStep;',
'          j += _if_aa * -(AA_POWER + loopStep) + loopStep;',
'        #endif',
'      #endif',
'',
'',
'      #ifdef BRANCHSAMPLE',
'      if (confidence > 0.0) {',
'      #endif',
'',
'        #ifdef CORRECT',
'          #define CORRECTION_MATH +( ( vec2((depth - dpos) / (dstep * correctPower)) * vstep ))',
'        #else',
'          #define CORRECTION_MATH',
'        #endif',
'          ',
'        #ifdef COLORAVG    ',
'          colSum += texture2D(uSampler, vpos CORRECTION_MATH) * confidence;',
'        #else',
'          posSum += (vpos CORRECTION_MATH) * confidence;    ',
'        #endif',
'          confidenceSum += confidence;',
'          ',
'      #ifdef BRANCHSAMPLE',
'      }',
'      #endif',
'',
'        ',
'      #if DEBUG > 2',
'        gl_FragColor = vec4(vector[0] / 2.0 + 1.0, vector[1].xy / 2.0 + 1.0);',
'      #elif DEBUG > 1',
'        gl_FragColor = vec4(confidenceSum, depth, dpos, 0);',
'      #elif DEBUG > 0',
'        gl_FragColor = vec4(confidence, depth, dpos, 0);',
'      #endif',
'      #ifdef DEBUGBREAK ',
'      if (i == float(DEBUGBREAK)) {',
'          dstep = 1.0;',
'      }     ',
'      #endif',
'',
'    #ifdef BRANCHLOOP',
'    }',
'    #endif',
'  };',
'',
'  #if defined(COLORAVG) && DEBUG == 0',
'    gl_FragColor = colSum / vec4(confidenceSum);',
'  #elif !defined(COLORAVG) && DEBUG == 0',
'    gl_FragColor = texture2D(uSampler, posSum / confidenceSum);',
'  #endif',
'',
'}',


  ];

  this.quality = quality;
  if (quality) {
    this.fragmentSrc.unshift('#define QUALITY ' + quality);
  }
};
 
PIXI.DepthPerspectiveFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
PIXI.DepthPerspectiveFilter.prototype.constructor = PIXI.DepthPerspectiveFilter;
 
PIXI.DepthPerspectiveFilter.prototype.onTextureLoaded = function()
{
  this.uniforms.mapDimensions.value.x = this.uniforms.displacementMap.value.width;
  this.uniforms.mapDimensions.value.y = this.uniforms.displacementMap.value.height;
 
  this.uniforms.displacementMap.value.baseTexture.off('loaded', this.boundLoadedFunction);
};
 
/**
 * The texture used for the displacemtent map * must be power of 2 texture at the moment
 *
 * @property map
 * @type Texture
 */
Object.defineProperty(PIXI.DepthPerspectiveFilter.prototype, 'map', {
  get: function() {
    return this.uniforms.displacementMap.value;
  },
  set: function(value) {
    this.uniforms.displacementMap.value = value;
  }
});
 
/**
 * The multiplier used to scale the displacement result from the map calculation.
 *
 * @property scale
 * @type Point
 */
Object.defineProperty(PIXI.DepthPerspectiveFilter.prototype, 'scale', {
  get: function() {
    return this.uniforms.scale.value;
  },
  set: function(value) {
    this.uniforms.scale.value = value;
  }
});
 
/**
 * Focus point in paralax
 *
 * @property focus
 * @type float
 */
Object.defineProperty(PIXI.DepthPerspectiveFilter.prototype, 'focus', {
  get: function() {
    return this.uniforms.focus.value;
  },
  set: function(value) {
    this.uniforms.focus.value = Math.min(1,Math.max(0,value));
  }
}); 

/**
 * Image enlargment
 *
 * @property enlarge
 * @type float
 */
Object.defineProperty(PIXI.DepthPerspectiveFilter.prototype, 'enlarge', {
  get: function() {
    return this.uniforms.enlarge.value;
  },
  set: function(value) {
    this.uniforms.enlarge.value = value;
  }
});

/**
 * The offset used to move the displacement map.
 *
 * @property offset
 * @type Point
 */
Object.defineProperty(PIXI.DepthPerspectiveFilter.prototype, 'offset', {
  get: function() {
    return this.uniforms.offset.value;
  },
  set: function(value) {
    this.uniforms.offset.value = value;
  }
});

PIXI.glReadPixels = function(gl, frameBuffer, x, y, width, height, pixels) {
  if (!pixels) pixels = new Uint8Array(4 * width * height);

  if (frameBuffer instanceof PIXI.RenderTexture) {
    frameBuffer = frameBuffer.textureBuffer.frameBuffer;
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);        
  gl.viewport(0, 0, width, height);
  gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);    

  return pixels;
};

PIXI.glReadPixelsToCanvas = function(gl, frameBuffer, x, y, width, height) {
  var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      imgdata = ctx.createImageData(width, height);

  canvas.width = width;
  canvas.height = height;

  PIXI.glReadPixels(gl, frameBuffer, x, y, width, height, new Uint8Array(imgdata.data.buffer));

  ctx.putImageData(imgdata, 0, 0);

  return canvas;
};


angular.module('depthyApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/alert-modal.html',
    "<div class=modal-header><h4 class=modal-title ng-click=$dismiss()><i class=\"icon icon-back\"></i> Warning!</h4></div><div class=modal-body><p class=\"text-center margin-lg\">{{message}}</p></div><div class=modal-footer><button class=\"btn btn-default\" ng-click=$dismiss()>OK</button></div>"
  );


  $templateCache.put('views/alert-nodepth.html',
    "<div class=panel-heading><h3 class=panel-title>This image is flat as a pancake!</h3></div><div class=panel-body><p>Depthy works with photos shot using <a href=\"https://play.google.com/store/apps/details?id=com.google.android.GoogleCamera\" target=_blank>LensBlur</a> camera mode, or created with Depthy itself.</p><div class=\"btn-group btn-group-unjustified\"><div class=\"btn btn-default\" ng-click=imageInfo() ga>Load depthmap</div><div class=\"btn btn-default\" ng-click=drawDepthmap() ga>Draw it</div><div class=\"btn btn-default\" ng-click=selectFile($event) ga>Try another</div></div><div class=\"alert alert-warning alert-icon\" ng-if=Modernizr.android><i class=\"icon icon-warning\"></i> Google Photos strips out the depthmap. Select <code>Documents</code> when prompted and find your LensBlur photo on your device.</div></div>"
  );


  $templateCache.put('views/alert-noimage.html',
    "<div class=panel-heading><h3 class=panel-title>{{depthy.getLoadError() || 'No image!'}}</h3></div><div class=panel-body><p>Sorry, this image could not be loaded.</p><div class=\"btn-group btn-group-justified\"><div class=\"btn btn-default\" ng-click=selectFile($event)>Try another</div><div class=\"btn btn-default\" ng-click=depthy.leftpaneOpen()>Open the gallery</div></div></div>"
  );


  $templateCache.put('views/alert-webgl.html',
    "<div class=panel-heading><h3 class=panel-title>So sad!</h3></div><div class=panel-body><p>Sorry, <b>Depthy</b> works only on browsers supporting <b>WebGL</b>.</p><p ng-if=Modernizr.ios>Unfortunately, there's no official support on iOS. It should work on your Mac / PC / Android though.</p><p ng-if=Modernizr.android>It's strange, because it should work on Android. Check the latest <b>Chrome</b>, <b>Firefox</b> or <b>Opera</b>. Built-in browsers may not be fully supported.</p></div>"
  );


  $templateCache.put('views/draw.html',
    "<section id=draw ng-controller=DrawCtrl class=draw-mode-{{brushMode}} ng-class=\"{'brush-opened': brushOpened}\"><div class=draw-options><div class=draw-instructions>Here you can draw the depthmap with your {{Modernizr.mobile ? 'finger' : 'mouse'}}. Use the sliders to setup the brush.<br>Remember that <b>black</b> means <b>near</b> the screen, and white is far away.<br>Use <b>opacity</b> to make subtle changes, and <b>level</b> to draw at the same level as the point you start.</div><button class=\"draw-done btn btn-success\" ng-click=done() title=Finish ga><i class=\"icon icon-yes\"></i></button> <button class=\"draw-cancel btn btn-danger\" ng-click=cancel() title=Cancel ga><i class=\"icon icon-no\"></i></button> <button class=\"draw-undo btn btn-default option\" ng-click=drawer.toggleUndo() ng-class=\"{redo: drawer.getUndoMode() > 0}\" ng-disabled=\"drawer.getUndoMode() == 0\" title=Undo><i class=\"icon icon-undo\" ga></i></button> <button class=\"draw-preview btn btn-default option\" ng-click=togglePreview() ng-class=\"{active:preview == 2}\" title=Preview ga><i class=\"icon icon-eye\"></i></button> <button class=\"draw-options-toggle btn btn-default option\" ng-click=\"brushOpened = !brushOpened\" ng-class={active:brushOpened} title=\"Brush options\" ga><i class=\"icon icon-{{brushIcon()}}\"></i></button><div class=brush-options><button class=\"draw-picker btn btn-default option\" ng-model=brushMode btn-checkbox btn-checkbox-true=\"'picker'\" title=Picker ga><i class=\"icon icon-target\"></i></button> <button class=\"draw-level btn btn-default option\" ng-model=brushMode btn-checkbox btn-checkbox-true=\"'level'\" title=Level ga><i class=\"icon icon-magnet\"></i></button><div class=brush-sliders><div class=\"option draw-brush-depth\"><div class=range-slider ng-model=drawOpts.depth range-stepper=\"{snap: 0}\" data-values=\"[\n" +
    "            {value:0, label: 'Near'},\n" +
    "            {value:0.25, label: ''},\n" +
    "            {value:0.5, label: ''},\n" +
    "            {value:0.75, label: ''},\n" +
    "            {value:1, label: 'Far'}\n" +
    "          ]\"><div class=rs-title><i class=\"icon icon-arrow-sm-left\"></i><span>depth</span><i class=\"icon icon-arrow-sm-right\"></i></div><div class=rs-thumb><svg width=20 height=20><circle cx=10 cy=10 r=9 fill=black stroke=#ffffff stroke-width=1.5></circle><circle cx=10 cy=10 r=9 opacity={{getValue(v)}} fill=white stroke=#ffffff stroke-width=1.5></circle></svg></div></div></div><div class=\"option draw-brush-size\"><div class=range-slider ng-model=drawOpts.size range-stepper=\"{snap: 0}\" data-values=\"[\n" +
    "            {value:.005, label: 'Small'},\n" +
    "            {value:.025, label: ''},\n" +
    "            {value:.05, label: ''},\n" +
    "            {value:.2, label: ''},\n" +
    "            {value:.4, label: 'Large'}\n" +
    "          ]\"><div class=rs-title><i class=\"icon icon-arrow-sm-left\"></i><span>size</span><i class=\"icon icon-arrow-sm-right\"></i></div><div class=rs-thumb><svg width=20 height=20><circle cx=10 cy=10 r=\"{{Math.max(1, Math.min(10, position / 4 * 10))}}\" fill=white stroke=none></circle></svg></div></div></div><div class=\"option draw-brush-hardness\"><div class=range-slider ng-model=drawOpts.hardness range-stepper=\"{snap: 0}\" data-values=\"[\n" +
    "            {value:0.0, label: 'Soft'},\n" +
    "            {value:0.25, label: ''},\n" +
    "            {value:0.5, label: ''},\n" +
    "            {value:0.75, label: ''},\n" +
    "            {value:1.0, label: 'Hard'}\n" +
    "          ]\"><div class=rs-title><i class=\"icon icon-arrow-sm-left\"></i><span>hardness</span><i class=\"icon icon-arrow-sm-right\"></i></div><div class=rs-thumb><svg width=20 height=20><circle cx=10 cy=10 r=\"{{Math.max(1, Math.min(9, getValue(v) * 9))}}\" fill=white stroke=none></circle><circle cx=10 cy=10 r=9 fill=none stroke=#ffffff stroke-width=1.5></circle></svg></div></div></div><div class=\"option draw-brush-opacity\"><div class=range-slider ng-model=drawOpts.opacity range-stepper=\"{snap: 0}\" data-values=\"[\n" +
    "            {value:0.01, label: 'Transparent'},\n" +
    "            {value:0.1, label: ''},\n" +
    "            {value:0.25, label: ''},\n" +
    "            {value:0.5, label: ''},\n" +
    "            {value:1, label: 'Opaque'}\n" +
    "          ]\"><div class=rs-title><i class=\"icon icon-arrow-sm-left\"></i><span>opacity</span><i class=\"icon icon-arrow-sm-right\"></i></div><div class=rs-thumb><svg width=20 height=20><circle cx=10 cy=10 r=9 opacity=\"{{(getValue(v) + 0.1) / 0.9}}\" fill=white></circle></svg></div></div></div></div></div></div></section>"
  );


  $templateCache.put('views/export-anaglyph-modal.html',
    "<div class=modal-header><h4 class=modal-title ng-click=$dismiss()><i class=\"icon icon-back\"></i>Put your glasses on</h4></div><div class=modal-body><div class=text-center><div class=\"thumbnail thumbnail-lg\" ng-class=\"{loading: loading}\"><a image-source=export-anaglyph-modal target=_blank download=\"{{depthy.opened.getFilename() + '-anaglyph.jpg'}}\"><img image-source=\"export-anaglyph-modal\"></a></div></div><p class=\"text-muted text-center\">{{depthy.downloadInstructions}} to save it.</p><div class=\"alert alert-info alert-icon margin-top-xl\"><i class=\"icon icon-eye\"></i> You'll need <a href=https://en.wikipedia.org/wiki/Anaglyph_3D target=_blank>red/cyan 3D glasses</a> to view this image properly.<br></div><div class=\"alert alert-info alert-icon\"><i class=\"icon icon-info\"></i> You can tweek the result by changing the effect's strength and focus point in options.<br></div></div><div class=modal-footer><button class=\"btn btn-default\" ng-click=$dismiss()>Close</button></div>"
  );


  $templateCache.put('views/export-gif-modal.html',
    "<div class=modal-header><h4 class=modal-title ng-click=$dismiss()><i class=\"icon icon-back\"></i> {{imageReady ? 'Your GIF is ready to take!' : 'Please wait...'}}</h4></div><div class=modal-body><div class=\"export-progress margin-xl anim-expand long\" ng-hide=imageReady><div class=\"progress progress-md progress-striped active\"><div class=progress-bar role=progressbar ng-style=\"{width: exportProgress * 100 + '%'}\"></div></div><div class=\"alert alert-warning alert-icon\" ng-if=\"Modernizr.mobile ? (depthy.exportSize > 150 || viewer.animateDuration > 1) : (depthy.exportSize > 300 || viewer.animateDuration > 2)\"><i class=\"icon icon-stopwatch\"></i> Generating GIFs is a tedious task. If it takes too long, choose a smaller size or make it shorter...</div></div><div class=\"text-center export-image anim-expand verylong ng-hide\" ng-show=imageReady><div class=\"thumbnail center-block\"><a image-source=export-gif target=_blank download=\"{{depthy.opened.getFilename() + '.gif'}}\"><img image-source=\"export-gif\"></a><h5>{{imageSize / 1024 | number: 0}}KB</h5></div><p class=text-muted>{{depthy.downloadInstructions}} to save it.</p><div class=\"alert alert-warning alert-icon text-left\" ng-if=\"Modernizr.android && Modernizr.chrome && !Modernizr.adownload && imageSize > 1000000\"><i class=\"icon icon-warning\"></i> Due to the bug in Chrome the option to save the GIF can be unavailable. You'll have to make it smaller or share it.</div><div class=\"alert alert-warning alert-icon text-left\" ng-if=imageOverLimit><i class=\"icon icon-meter\"></i> It's <b>too big</b> too share! You'll have to share it on your own, or make it smaller...</div><div class=margin-top-lg ng-if=!imageOverLimit><div ng-switch=shareUrl class=export-share><div class=\"anim-expand long\" ng-switch-when=\"\"><button class=\"btn btn-success btn-lg col-sm-6 col-xs-8 center-block margin-bottom-lg\" ng-click=share()><i class=\"icon icon-upload\"></i>Share it!</button><div class=\"alert alert-danger alert-icon text-left anim-expand\" ng-if=shareError><i class=\"icon icon-error\"></i> {{shareError}}</div><div class=\"alert alert-info alert-icon text-left\" class=anim-expand><i class=\"icon icon-cloud\"></i> Your GIF will be uploaded to <a href=https://imgur.com target=_blank>Imgur.com</a>.<br>It will remain relatively private until you share it too much and it goes viral.</div></div><div class=\"margin-xl anim-expand\" ng-switch-when=sharing><div class=\"progress progress-md progress-striped active\"><div class=progress-bar role=progressbar ng-style=\"{width: shareProgress * 100 + '%'}\"></div></div><p class=text-muted>Uploading, please wait...</p></div><div class=anim-expand ng-switch-default><div class=\"alert alert-success alert-lg alert-icon\"><i class=\"icon icon-link\"></i> <a href={{shareUrl}} target=_blank>{{shareUrl}}</a></div><div class=\"btn-group btn-group-shares margin-lg\"><div class=\"btn btn-icon btn-twitter\" share-popup=twitter share-options=share ga=\"['send', 'event', 'png', 'share', 'twitter']\"><i class=\"icon icon-lg icon-twitter\"></i></div><div class=\"btn btn-icon btn-facebook\" share-popup=facebook share-options=share ga=\"['send', 'event', 'png', 'share', 'facebook']\"><i class=\"icon icon-lg icon-facebook\"></i></div><div class=\"btn btn-icon btn-google\" share-popup=google share-options=share ga=\"['send', 'event', 'png', 'share', 'google']\"><i class=\"icon icon-lg icon-googleplus\"></i></div></div></div></div></div><div class=\"alert alert-info alert-icon text-left\"><i class=\"icon icon-heart\"></i> Want some good karma? Use <b class=text-success>#depthy</b> in your shares, thanks!</div></div></div><div class=modal-footer><button class=\"btn btn-default\" ng-click=$dismiss()>Close</button></div>"
  );


  $templateCache.put('views/export-gif-popup.html',
    "<div class=popup-header>How do you want your GIF?</div><div class=\"popup-content scrollable\"><div class=option><div class=range-stepper ng-model=depthy.exportSize range-stepper=\"{precision: 32, snap: 0.2}\" data-values=\"[\n" +
    "      {value: 160, label: 'Small'},\n" +
    "      {value: 320, label: 'Standard'},\n" +
    "      {value: 512, label: 'Large'},\n" +
    "  ]\"></div></div><div ng-show=customize class=\"anim-expand long\"><div class=option ng-include=\"'views/options-animation.html'\"></div><div class=option ng-include=\"'views/options-movement.html'\"></div></div><div ng-show=!customize class=\"anim-expand short\"><div class=\"btn btn-default btn-lg btn-block\" ng-model=customize btn-checkbox>Customize</div></div></div><div class=popup-footer><div class=\"btn-group btn-group-unjustified\"><div class=\"btn btn-success btn-lg long\" ng-click=\"depthy.activePopup.resolve(); exportAnimationRun('gif')\">Do it!</div><div class=\"btn btn-default btn-lg\" ng-click=depthy.activePopup.reject()>Later?</div></div></div>"
  );


  $templateCache.put('views/export-jpg-modal.html',
    "<div class=modal-header><h4 class=modal-title ng-click=$dismiss()><i class=\"icon icon-back\"></i>Image saver</h4></div><div class=modal-body><div class=text-center><div class=thumbnail ng-class=\"{loading: loading}\"><a image-source=export-jpg-modal target=_blank download=\"{{depthy.opened.getFilename() + '.jpg'}}\"><img image-source=\"export-jpg-modal\"></a></div></div><p class=\"text-muted text-center\">{{depthy.downloadInstructions}} to save it.</p><div class=\"alert alert-info alert-icon margin-top-xl\"><i class=\"icon icon-info\"></i> You can open this image in Depthy, Google Camera's library, or any tool that understands Google's depthmaps.<br></div><div class=\"alert alert-info alert-icon\"><i class=\"icon icon-warning\"></i> Most editing software will probably remove the depthmap from your image. Do not try to resize, or crop the image.</div></div><div class=modal-footer><button class=\"btn btn-default\" ng-click=$dismiss()>Close</button></div>"
  );


  $templateCache.put('views/export-png-modal.html',
    "<div class=modal-header><h4 class=modal-title ng-click=$dismiss()><i class=\"icon icon-back\"></i>Image saver</h4></div><div class=modal-body><div class=text-center><div class=thumbnail ng-class=\"{loading: loading}\"><a image-source=export-png-modal target=_blank download=\"{{depthy.opened.getFilename() + '.png'}}\"><img image-source=\"export-png-modal\"></a></div></div><p class=\"text-muted text-center\">{{depthy.downloadInstructions}} to save it.</p><div class=\"alert alert-info alert-icon margin-top-xl\"><i class=\"icon icon-info\"></i> You can edit this image and open it later in <b>Depthy</b> to see the effects.<br></div><div class=\"alert alert-info alert-icon\"><i class=\"icon icon-stack\"></i> Keep in mind that less transparent spots are closer to the screen. Check the samples for reference.</div></div><div class=modal-footer><button class=\"btn btn-default\" ng-click=$dismiss()>Close</button></div>"
  );


  $templateCache.put('views/export-webm-modal.html',
    "<div class=modal-header><h4 class=modal-title ng-click=$dismiss()><i class=\"icon icon-back\"></i> {{ready ? 'Your Video is ready to take!' : 'Please wait...'}}</h4></div><div class=modal-body><div class=\"export-progress margin-xl anim-expand long\" ng-hide=ready><div class=\"progress progress-md progress-striped active\"><div class=progress-bar role=progressbar ng-style=\"{width: (exportProgress) * 100 + '%'}\"></div></div><div class=\"alert alert-warning alert-icon\" ng-if=Modernizr.mobile><i class=\"icon icon-stopwatch\"></i> Generating videos on a mobile is a tedious task. If it takes too long, choose a smaller size or make it shorter...</div></div><div class=\"text-center export-image anim-expand verylong ng-hide\" ng-show=ready><div class=\"thumbnail center-block\"><video src={{videoUrl}} loop autoplay controls></video><h5>{{size / 1024 | number: 0}}KB</h5></div><div class=margin><a class=\"btn btn-success margin\" ng-href={{videoUrl}} target=_blank download=\"{{depthy.opened.getFilename() + '.webm'}}\"><i class=\"icon icon-download\"></i>Save this video</a></div><div class=\"alert alert-info alert-icon text-left\"><i class=\"icon icon-info\"></i> You can upload this video to <a href=\"https://gfycat.com/\" target=_blank>gfycat</a>, or edit it in any program supporting WebM format.</div><div class=\"alert alert-info alert-icon text-left\"><i class=\"icon icon-heart\"></i> Want some good karma? Use <b class=text-success>#depthy</b> if you share it, thanks!</div></div></div><div class=modal-footer><button class=\"btn btn-default\" ng-click=$dismiss()>Close</button></div>"
  );


  $templateCache.put('views/export-webm-popup.html',
    "<div class=popup-header>How do you want your WebM video?</div><div class=\"popup-content scrollable\"><div class=option><div class=\"btn-group btn-group-justified\"><div class=range-stepper ng-model=depthy.exportSize range-stepper=\"{precision: 32, snap: 0.2}\" data-values=\"[\n" +
    "      {value: 160, label: 'Tiny'},\n" +
    "      {value: 320, label: 'Small'},\n" +
    "      {value: 512, label: 'Standard'},\n" +
    "      {value: 1024, label: 'Large'},\n" +
    "    ]\"></div></div></div><div ng-show=customize class=\"anim-expand long\"><div class=option ng-include=\"'views/options-animation.html'\"></div><div class=option ng-include=\"'views/options-movement.html'\"></div></div><div ng-show=!customize class=\"anim-expand short\"><div class=\"btn btn-default btn-lg btn-block\" ng-model=customize btn-checkbox>Customize</div></div></div><div class=popup-footer><div class=\"btn-group btn-group-unjustified\"><div class=\"btn btn-success btn-lg long\" ng-click=\"depthy.activePopup.resolve(); exportAnimationRun('webm')\">Do it!</div><div class=\"btn btn-default btn-lg\" ng-click=depthy.activePopup.reject()>Later?</div></div></div>"
  );


  $templateCache.put('views/howto-lensblur.html',
    "<div class=modal-body><p class=text-center>Bla bla bla</p></div><div class=modal-footer><button class=\"btn btn-default\" ng-click=$dismiss()>OK</button></div>"
  );


  $templateCache.put('views/image-info-modal.html',
    "<span fileselect=info.depthFiles><div class=modal-header><h4 class=modal-title ng-click=$dismiss()><i class=\"icon icon-back\"></i>Image properties</h4></div><div class=modal-body><div class=text-center><div class=\"thumbnails-set margin-top-none\"><div class=thumbnail ng-if=depthy.hasDepthmap() ng-class=\"{loading: loading}\"><a image-source=depth target=_blank download=\"{{depthy.opened.getFilename() + '-depthmap.jpg'}}\"><img image-source=depth></a><h4>Depthmap</h4></div><div class=thumbnail ng-if=depthy.hasOriginalImage() ng-class=\"{loading: loading}\"><a image-source=alternative target=_blank download=\"{{depthy.opened.getFilename() + '-alternative.jpg'}}\"><img image-source=alternative></a><h4>Sharp image</h4></div></div></div><p class=\"text-muted text-center\" ng-if=\"depthy.hasDepthmap() || depthy.hasOriginalImage()\">{{depthy.downloadInstructions}} to save it.</p><div class=text-center><button class=\"btn btn-success\" ng-click=selectFile($event)><i class=icon ng-class=\"isDepthmapProcessing ? 'icon-loading' : 'icon-open'\"></i>{{depthy.hasDepthmap() ? 'Replace' : 'Open'}} depthmap</button></div><div class=\"alert alert-info alert-icon margin-top-xl\"><i class=\"icon icon-info\"></i><p>You can create depthmaps for any image yourself! Then click \"Open depthmap\" above to load it.</p></div><div class=\"alert alert-info alert-icon\"><i class=\"icon icon-stack\"></i><p>Keep in mind that darker spots are closer to the screen. Check the samples for reference.</p></div></div><div class=modal-footer><button class=\"btn btn-default\" ng-click=$dismiss()>Close</button></div></span>"
  );


  $templateCache.put('views/main.html',
    "<div id=main ng-controller=MainCtrl ng-class=\"{\n" +
    "    'leftpane-opened': depthy.isLeftpaneOpened() === true, \n" +
    "    'leftpane-gallery': depthy.isLeftpaneOpened() === 'gallery', \n" +
    "    'zen-mode': depthy.zenMode,\n" +
    "    'draw-mode': depthy.drawMode,\n" +
    "    'offline': depthy.isOffline(),\n" +
    "    'depthy-ready': depthy.isReady(),\n" +
    "    'depthy-loading': depthy.isLoading()}\"><div id=hamburger class=\"icon icon-navicon-bold\" ng-click=depthy.leftpaneToggle()></div><nav id=navbar class=text-right><div class=btn-group><button class=\"btn btn-default btn-control\" ng-click=screenfull.toggle() ng-if=\"screenfull.enabled && !screenfull.isFullscreen\" title=Fullscreen ga><i class=\"icon icon-expand\"></i></button></div></nav><div id=leftpane ng-swipe-left=depthy.leftpaneClose()><div class=scroll><section id=about><header><div class=logo ng-include=\"'images/logo.svg'\" ng-click=depthy.leftpaneClose()></div><p class=lead>the third dimension viewer</p></header><article class=text-center><div class=\"button-open btn btn-lg btn-success center-block\" ng-click=selectFile($event)><i class=icon ng-class=\"depthy.isLoading() ? 'icon-loading' : 'icon-open'\"></i>Open photo</div></article></section><section class=\"alert alert-warning alert-icon anim-expand\" ng-if=depthy.isOffline()><i class=\"icon icon-powercord\"></i> You're working offline.<br>Some feature may not be available!</section><section class=\"alert alert-success alert-icon alert-button anim-expand\" ng-if=depthy.gotUpdate><i class=\"icon icon-loop\"></i><div class=\"btn btn-success btn-sm pull-right\" ng-click=depthy.reload()>Reload</div><div class=alert-body>There is a new version available!</div></section><section class=\"alert alert-success alert-icon alert-button anim-expand\" ng-if=depthy.newStuff.length><i class=\"icon icon-trophy\"></i><div class=\"btn btn-success btn-sm pull-right\" ng-click=depthy.hideNewStuff()>Got it!</div><div class=alert-body>New stuff in this version:<div ng-repeat=\"info in depthy.newStuff\">{{info}}</div></div></section><section id=gallery><ul><li ng-repeat=\"image in depthy.gallery\" ng-style=\"{'background-image':'url('+image.thumb+')'}\" ng-click=openImage(image) ng-class=\"'type-' + image.getType()\" ng-if=image.isAvailable()></li></ul></section><section class=text-center id=share><div class=\"btn-group btn-group-shares btn-group-justified\"><div class=\"btn btn-icon btn-twitter\" share-popup=twitter share-options=depthy.share ga=\"['send', 'event', 'depthy', 'share', 'twitter']\"><i class=\"icon icon-twitter\"></i></div><div class=\"btn btn-icon btn-facebook\" share-popup=facebook share-options=depthy.share ga=\"['send', 'event', 'depthy', 'share', 'facebook']\"><i class=\"icon icon-facebook\"></i></div><div class=\"btn btn-icon btn-google\" share-popup=google share-options=depthy.share ga=\"['send', 'event', 'depthy', 'share', 'google']\"><i class=\"icon icon-googleplus\"></i></div></div><div class=\"btn-group btn-group-shares btn-group-justified\"><div class=\"btn btn-sm btn-twitter\" share-popup=twitter-follow share-options=\"{name: 'staminapl'}\" ga=\"['send', 'event', 'depthy', 'follow', 'twitter']\"><i class=\"icon icon-twitter\"></i>Follow</div><a class=\"btn btn-sm btn-google\" href=https://plus.google.com/104689068982536734877 target=_blank ga=\"['send', 'event', 'depthy', 'follow', 'google']\"><i class=\"icon icon-googleplus\"></i>Follow</a></div></section><section id=footer>Depthy <span ng-click=debugClicked()>{{version}}</span> created by <a href=\"https://www.stamina.pl/\">Rafał Lindemann</a>.<br>Ideas? Issues? Code? It's open sourced on <a href=https://github.com/panrafal/depthy>GitHub</a>!</section></div></div><section id=viewer><div class=alerts><div class=\"panel panel-danger\" ng-include=\"!Modernizr.webgl ? 'views/alert-webgl.html' : null\"></div><div class=\"alert alert-info\" ng-if=\"depthy.isReady() && depthy.movearoundShow\" ng-click=\"depthy.movearoundShow = false\"><p>Move your {{Modernizr.devicemotion && Modernizr.mobile ? 'device' : 'cursor'}} around to see the effect</p></div><div class=\"panel panel-danger\" ng-include=\"(Modernizr.webgl && !depthy.isLoading() && !depthy.hasImage()) ? 'views/alert-noimage.html' : null\"></div><div class=\"panel panel-warning\" ng-include=\"(Modernizr.webgl && !depthy.isLoading() && depthy.hasImage() && !depthy.hasDepthmap()) ? 'views/alert-nodepth.html' : null\"></div></div><div class=depthy-viewer depthy-viewer=depthy.viewer ng-click=depthy.zenModeToggle() ng-swipe-right=depthy.leftpaneOpen()><canvas></canvas><div class=\"icon icon-loading\"></div></div><div class=buttons-options ng-show=!depthy.activePopup><div class=btn-group><button class=\"btn btn-default btn-control\" ng-click=shareOptions() ng-disabled=\"!depthy.hasCompleteImage() || !depthy.isReady()\" title=Share><i class=\"icon icon-share\"></i></button> <button class=\"btn btn-default btn-control\" ng-click=imageOptions() ng-disabled=\"!depthy.hasCompleteImage() || !depthy.isReady()\" title=Options ga><i class=\"icon icon-settings\"></i></button> <button class=\"btn btn-default btn-control\" ng-click=imageInfo() ng-disabled=\"!Modernizr.webgl || !depthy.hasImage() || depthy.isLoading()\" title=Info ga><i class=\"icon icon-image\"></i></button> <button class=\"btn btn-default btn-control\" ng-click=drawDepthmap() ng-disabled=\"!Modernizr.webgl || !depthy.hasImage() || depthy.isLoading()\" title=Paint ga><i class=\"icon icon-draw\"></i></button></div></div></section><span ng-include=\"depthy.drawMode ? 'views/draw.html' : null\"></span><section id=popup><div class=\"popup options-popup\" ng-show=\"depthy.activePopup.state === 'image.options'\" ng-include=\"'views/options-popup.html'\"></div><div class=\"popup export-popup\" ng-include=\"depthy.activePopup.state === 'export.gif.options' ? 'views/export-gif-popup.html' : null\"></div><div class=\"popup export-popup\" ng-include=\"depthy.activePopup.state === 'export.webm.options' ? 'views/export-webm-popup.html' : null\"></div><div class=\"popup share-popup\" ng-show=\"depthy.activePopup.state === 'share.options'\" ng-include=\"'views/share-popup.html'\"></div></section></div>"
  );


  $templateCache.put('views/options-animation.html',
    "<div class=option><div class=range-stepper ng-model=viewer.animateDuration range-stepper=\"{units:'s'}\" data-values=\"[\n" +
    "    {value:0.07, label:'x_X'}, 1, 2, 4, 6\n" +
    "  ]\"></div></div><div class=option><div class=range-stepper ng-model=viewer.animateScale range-stepper data-values=\"[\n" +
    "    {value:{x:1, y:0}, label: 'Horizontal'},\n" +
    "    {value:{x:1, y:1}, label: 'Circular'},\n" +
    "    {value:{x:0, y:1}, label: 'Vertical'}\n" +
    "  ]\"><div class=rs-thumb><svg width=20 height=20><ellipse cx=10 cy=10 rx=\"{{Math.max(0.5, v.value.x * 9)}}\" ry=\"{{Math.max(0.5, v.value.y * 9)}}\" fill=none stroke=white stroke-width=2></ellipse></svg></div></div></div>"
  );


  $templateCache.put('views/options-debug.html',
    "<div class=option><div class=range-stepper ng-model=viewer.quality range-stepper=\"{snap: 1}\" data-values=\"[\n" +
    "    {value: false, label: 'A'}, 1, 2, 3, 4, 5\n" +
    "  ]\"></div></div><div class=option><div class=range-stepper ng-model=viewer.depthBlurSize range-stepper=\"{units:'px'}\" data-values=\"[\n" +
    "    0,4,8,16,32\n" +
    "  ]\"></div></div>"
  );


  $templateCache.put('views/options-movement.html',
    "<div class=option><div class=range-stepper ng-model=viewer.depthScale range-stepper=\"{units:'%', format:'%'}\" data-values=\"[\n" +
    "    {value:0.5, label:'Calm'}, \n" +
    "    {value:1.0, label:'Normal'}, \n" +
    "    {value:2.0, label:'Dramatic'}\n" +
    "  ]\"></div></div><div class=option><div class=range-stepper ng-model=viewer.depthFocus range-stepper=\"{units:'%', format:'%'}\" data-values=\"[\n" +
    "    {value:0.0, label:'Near'}, \n" +
    "    {value:0.5, label:'Middle'}, \n" +
    "    {value:1.0, label:'Far'}\n" +
    "  ]\"></div></div>"
  );


  $templateCache.put('views/options-popup.html',
    "<div class=\"popup-content scrollable\"><div class=option><div class=\"btn-group btn-group-justified\"><div class=\"btn btn-default\" ng-model=viewer.fit btn-checkbox btn-checkbox-true=\"'cover'\" btn-checkbox-false=\"'contain'\"><i class=\"icon icon-checkbox\"></i>Expand</div><div class=\"btn btn-default\" ng-model=viewer.animate btn-checkbox><i class=\"icon icon-checkbox\"></i>Hypnotize</div><div class=\"btn btn-default\" ng-model=depthy.useOriginalImage ng-if=depthy.hasOriginalImage() btn-checkbox><i class=\"icon icon-checkbox\"></i>Sharpen</div></div></div><div ng-include=\"viewer.animate ? 'views/options-animation.html' : null\" class=anim-expand></div><div class=option ng-include=\"'views/options-movement.html'\"></div><div class=option ng-include=\"'views/options-style.html'\"></div><div class=option ng-include=\"depthy.debug ? 'views/options-debug.html' : null\"></div></div><div class=popup-footer><button class=\"btn btn-default btn-lg btn-block\" ng-click=depthy.activePopup.reject()>OK</button></div>"
  );


  $templateCache.put('views/options-style.html',
    ""
  );


  $templateCache.put('views/share-png-modal.html',
    "<div class=modal-header><h4 class=modal-title ng-click=$dismiss()><i class=\"icon icon-back\"></i>Sharing is caring!</h4></div><div class=\"modal-body text-center\"><p class=\"alert alert-danger alert-icon margin-xl\" ng-if=uploadError class=anim-expand><i class=\"icon icon-error\"></i>{{uploadError}}</p><div ng-if=\"!share && !uploadError\" class=\"margin-xl anim-expand long\"><div class=\"progress progress-md progress-striped active\"><div class=progress-bar role=progressbar ng-style=\"{width: uploadProgress * 100 + '%'}\"></div></div><p class=text-muted>Uploading, please wait...</p></div><div ng-if=share class=\"anim-expand long\"><p>Copy this link and use it however you want:</p><div class=\"alert alert-success alert-lg alert-icon\"><i class=\"icon icon-link\"></i> <a href={{share.url}}>{{share.url}}</a></div><div class=\"btn-group btn-group-shares margin-lg\"><div class=\"btn btn-icon btn-twitter\" share-popup=twitter share-options=share ga=\"['send', 'event', 'png', 'share', 'twitter']\"><i class=\"icon icon-lg icon-twitter\"></i></div><div class=\"btn btn-icon btn-facebook\" share-popup=facebook share-options=share ga=\"['send', 'event', 'png', 'share', 'facebook']\"><i class=\"icon icon-lg icon-facebook\"></i></div><div class=\"btn btn-icon btn-google\" share-popup=google share-options=share ga=\"['send', 'event', 'png', 'share', 'google']\"><i class=\"icon icon-lg icon-googleplus\"></i></div></div><div class=\"alert alert-info alert-icon text-left\"><i class=\"icon icon-heart\"></i> Want some good karma? Use <b class=text-success>#depthy</b> in your shares, thanks!</div><div class=\"alert alert-info alert-icon text-left\" ng-if=shareImage.storeUrl class=anim-expand><i class=\"icon icon-cloud\"></i> This image is hosted on <a href={{shareImage.storeUrl}} target=_blank>{{shareImage.store.name || shareImage.storeUrl}}</a>.</div></div></div><div class=modal-footer><button class=\"btn btn-default\" ng-click=$dismiss()>Close</button></div>"
  );


  $templateCache.put('views/share-popup.html',
    "<div class=\"popup-content scrollable\"><button class=\"btn btn-primary btn-block btn-lg\" ng-click=sharePngRun()>Share</button><div class=\"btn-group btn-group-justified\"><div class=\"btn btn-default btn-block btn-lg\" ng-click=exportAnaglyphRun()>Create anaglyph 3D</div></div><div class=\"btn-group btn-group-justified\"><div class=\"btn btn-default btn-lg\" ng-click=\"exportAnimationOptions('gif')\">Create GIF</div><div class=\"btn btn-default btn-lg\" ng-if=Modernizr.webp ng-click=\"exportAnimationOptions('webm')\">Create Video</div></div><div class=\"btn-group btn-group-justified\"><div class=\"btn btn-default btn-block btn-lg\" ng-click=exportPngRun()>Save as PNG</div><div class=\"btn btn-default btn-block btn-lg\" ng-click=exportJpgRun()>Save as JPG</div></div></div><div class=popup-footer><button class=\"btn btn-default btn-block btn-lg\" ng-click=depthy.activePopup.reject()>Not now</button></div>"
  );


  $templateCache.put('bower_components/angular-ui-bootstrap/template/modal/backdrop.html',
    "<div class=\"modal-backdrop fade {{ backdropClass }}\" ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1040 + (index && 1 || 0) + index*10}\"></div>"
  );


  $templateCache.put('bower_components/angular-ui-bootstrap/template/modal/window.html',
    "<div tabindex=-1 role=dialog class=\"modal fade\" ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\" ng-click=close($event)><div class=modal-dialog ng-class=\"{'modal-sm': size == 'sm', 'modal-lg': size == 'lg'}\"><div class=modal-content modal-transclude></div></div></div>"
  );

}]);

angular.module('depthyApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('template/modal/backdrop.html',
    "<div class=\"modal-backdrop fade {{ backdropClass }}\" ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1040 + (index && 1 || 0) + index*10}\"></div>"
  );


  $templateCache.put('template/modal/window.html',
    "<div tabindex=-1 role=dialog class=\"modal fade\" ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\" ng-click=close($event)><div class=modal-dialog ng-class=\"{'modal-sm': size == 'sm', 'modal-lg': size == 'lg'}\"><div class=modal-content modal-transclude></div></div></div>"
  );

}]);

angular.module('depthyApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('images/logo.svg',
    "<svg xmlns=\"https://www.w3.org/2000/svg\" viewBox=\"28.8 178.8 440.5 139.8\" enable-background=\"new 28.8 178.8 440.5 139.8\"><g fill=\"#E5E5E4\"><path d=\"M134.8 249.2c0 4.3-.7 8.2-2 11.7s-3.3 6.5-5.8 9.1c-2.5 2.5-5.5 4.5-8.9 5.8-3.5 1.4-7.3 2.1-11.5 2.1H85v-57.5h21.5c4.2 0 8.1.7 11.5 2.1 3.5 1.4 6.5 3.3 8.9 5.9s4.4 5.6 5.8 9.1 2.1 7.4 2.1 11.7zm-8 0c0-3.5-.5-6.7-1.4-9.5-1-2.8-2.3-5.1-4.1-7.1s-3.9-3.4-6.4-4.4c-2.5-1-5.3-1.5-8.4-1.5H92.8v44.9h13.7c3.1 0 5.9-.5 8.4-1.5s4.7-2.5 6.4-4.4 3.1-4.3 4.1-7 1.4-6 1.4-9.5z\"/><path d=\"M185.5 220.4v6.3h-27.6v19.1h22.3v6.1h-22.3v19.6h27.6v6.3h-35.4v-57.5h35.4z\"/><path d=\"M210 256.4v21.5h-7.7v-57.5h17c3.6 0 6.8.4 9.5 1.3 2.7.8 4.9 2 6.7 3.6 1.8 1.6 3.1 3.4 3.9 5.6.9 2.2 1.3 4.6 1.3 7.3s-.5 5.1-1.4 7.3c-.9 2.2-2.3 4.1-4.1 5.7-1.8 1.6-4 2.9-6.7 3.7-2.7.9-5.7 1.3-9.2 1.3H210zm0-6.2h9.2c2.2 0 4.2-.3 5.9-.9 1.7-.6 3.1-1.4 4.3-2.5 1.1-1.1 2-2.3 2.6-3.8.6-1.5.9-3.1.9-4.9 0-3.7-1.1-6.5-3.4-8.6-2.3-2.1-5.7-3.1-10.2-3.1H210v23.8z\"/><path d=\"M294.3 220.4v6.5h-18.6v50.9h-7.8V227h-18.6v-6.5h45z\"/><path d=\"M353.8 277.9H346v-26.1h-31v26.1h-7.8v-57.5h7.8V246h31v-25.6h7.8v57.5z\"/><path d=\"M394.7 255v22.9H387V255l-21.1-34.6h6.8c.7 0 1.2.2 1.6.5.4.3.7.8 1 1.3l13.2 22.3c.5.9 1 1.8 1.3 2.6.4.8.7 1.6 1 2.4.3-.8.6-1.7 1-2.5.3-.8.8-1.7 1.3-2.6l13.1-22.3c.2-.4.6-.8 1-1.2.4-.4 1-.6 1.6-.6h6.9l-21 34.7z\"/></g><path fill=\"#E5E5E4\" d=\"M444 204v90H54v-90h390m5-5H49v100h400V199z\"/><path fill=\"#E6E7E8\" d=\"M444.5 183.8V204h19.8v109.7H33.8V183.8h410.7m5-5H28.8v139.8h440.5V199h-19.8v-20.2z\"/></svg>"
  );

}]);

'use strict';

angular.module('depthyApp')
.controller('ExportGifModalCtrl', function ($scope, $modalInstance, $rootElement, depthy, ga, $timeout) {
  $scope.exportProgress = -1;
  $scope.imageReady = false;
  $scope.shareUrl = '';
  $scope.tweetUrl = null;
  $scope.imageOverLimit = false;

  $timeout(function() {
    var exportPromise = depthy.exportGifAnimation(),
        sharePromise = null,
        imageDataUri = null,
        exportStarted = new Date(),
        gaLabel = 'size ' + depthy.exportSize + ' dur ' + depthy.viewer.animDuration;

    ga('send', 'event', 'gif', 'start', gaLabel);

    exportPromise.then(
      function exportSuccess(blob) {
        ga('send', 'timing', 'gif', 'created', new Date() - exportStarted, gaLabel);
        ga('send', 'event', 'gif', 'created', gaLabel, blob.size);
        $scope.imageSize = blob.size;
        $scope.imageOverLimit = blob.size > 2097152;

        var imageReader = new FileReader();
        imageReader.onload = function() {
          imageDataUri = imageReader.result;
          var url = URL.createObjectURL(blob);

          // this is way way waaay quicker if you set data uris directly......
          angular.element('img[image-source="export-gif"]').attr('src', url);
          angular.element('a[image-source="export-gif"]').attr('href', url);

          // var img = $rootElement.find('.export-modal .export-image img')[0];
          // if (Modernizr.android && Modernizr.chrome) {
          //   // chrome on Android can save only data uris, it's opposite for others
          //   img.src = imageDataUri;
          // } else {
          //   img.src = ;
          // }
          $scope.imageReady = true;
          $scope.$safeApply();
        };
        imageReader.readAsDataURL(blob);
      },
      function exportFailed() {
        $scope.exportError = 'Export failed';
      },
      function exportProgress(p) {
        $scope.exportProgress = p;
        $scope.$safeApply();
        // console.log(p)
      }
    );

    $scope.share = function() {
      ga('send', 'event', 'gif', 'upload', gaLabel, $scope.imageSize);
      $scope.shareUrl = 'sharing';
      $scope.shareError = null;
      $scope.shareProgress = 0;
      sharePromise = $.ajax({
        url: 'https://api.imgur.com/3/image.json',
        method: 'POST',
        headers: {
          Authorization: 'Client-ID ' + depthy.imgurId,
          Accept: 'application/json'
        },
        data: {
          image: imageDataUri.substr('data:image/gif;base64,'.length),
          type: 'base64',
          name: depthy.opened.title,
          title: depthy.opened.title + ' #depthy',
          description: 'Created using https://depthy.me'
        },
        xhr: function() {
          var xhr = new window.XMLHttpRequest();
          //Upload progress
          xhr.upload.addEventListener('progress', function(evt){
            if (evt.lengthComputable) {
              $scope.shareProgress = evt.loaded / evt.total;
              $scope.$safeApply();
            }
          }, false);
          return xhr;
        },
      }).done(function(response, status, xhr) {
        console.log(response, status, xhr);
        var id = response.data.id;

        ga('send', 'event', 'gif', 'upload-success');
        $scope.shareUrl = 'https://imgur.com/' + id;
        $scope.share = {
          url: $scope.shareUrl,
          title: depthy.opened.title + ' #depthy',
          img: 'https://i.imgur.com/' + id + '.gif'
        };
        sharePromise = null;
        $scope.$safeApply();
      }).fail(function(xhr, status) {
        var response = xhr.responseJSON || {};

        sharePromise = null;
        $scope.shareUrl = '';
        $scope.shareError = (response.data || {}).error || 'Something went wrong... Please try again.';
        console.error('Share failed with ', response);
        ga('send', 'event', 'gif', 'upload-error', status + ': ' + $scope.shareError);
        $scope.$safeApply();
      });

    };

    $modalInstance.result.finally(function() {
      console.log('close');
      if (exportPromise) exportPromise.abort();
      if (sharePromise) sharePromise.abort();
      if ($scope.imageUrl) URL.revokeObjectURL($scope.imageUrl);
    });
  }, depthy.modalWait);

});

'use strict';

angular.module('depthyApp')
.controller('ExportWebmModalCtrl', function ($scope, $modalInstance, $rootElement, depthy, ga, $timeout, $sce) {
  $scope.exportProgress = 0;
  $scope.imageReady = false;
  $scope.shareUrl = '';
  $scope.tweetUrl = null;
  $scope.imageOverLimit = false;

  $timeout(function() {
    var exportPromise = depthy.exportWebmAnimation(),
        sharePromise = null,
        imageDataUri = null,
        exportStarted = new Date(),
        gaLabel = 'size ' + depthy.exportSize + ' dur ' + depthy.viewer.animDuration;

    ga('send', 'event', 'webm', 'start', gaLabel);

    exportPromise.then(
      function exportSuccess(blob) {
        ga('send', 'timing', 'webm', 'created', new Date() - exportStarted, gaLabel);
        ga('send', 'event', 'webm', 'created', gaLabel, blob.size);

        $scope.size = blob.size;
        $scope.videoUrl = $sce.trustAsResourceUrl(URL.createObjectURL(blob));
        $scope.ready = true;

      },
      function exportFailed() {
        $scope.exportError = 'Export failed';
      },
      function exportProgress(p) {
        $scope.exportProgress = p;
        $scope.$safeApply();
      }
    );

    $modalInstance.result.finally(function() {
      if (exportPromise) exportPromise.abort();
      if ($scope.videoUrl) URL.revokeObjectURL($scope.videoUrl.toString());
    });
  }, depthy.modalWait);

});

'use strict';

angular.module('depthyApp')
.controller('ImageInfoModalCtrl', function ($scope, $modalInstance, ga, depthy, $timeout, StateModal) {
  $scope.info = {};
  $scope.loading = 2;

  // wait for dom
  $timeout(function() {
    if (depthy.hasDepthmap()) {
      depthy.getViewer().exportDepthmap().then(function(url) {
        var img = angular.element('img[image-source="depth"]')[0];
        img.onload = function() {
          --$scope.loading;
          $scope.$safeApply();
        };
        img.src = url;
        angular.element('a[image-source="depth"]').attr('href', url);
      });
    } else --$scope.loading;
    if (depthy.hasOriginalImage()) {
      var img = angular.element('img[image-source="alternative"]')[0];
      img.onload = function() {
        --$scope.loading;
        $scope.$safeApply();
      };
      img.src = depthy.opened.originalSource;
      angular.element('a[image-source="alternative"]').attr('href', depthy.opened.originalSource);
    } else --$scope.loading;
  }, depthy.modalWait);

  $scope.isDepthmapProcessing = false;
  $scope.$watch('info.depthFiles', function(files) {
    if (files && files.length) {
      $scope.isDepthmapProcessing = true;
      depthy.loadLocalDepthmap(files[0]).then(
        function(fromLensblur) {
          $scope.isDepthmapProcessing = false;
          ga('send', 'event', 'depthmap', 'parsed', fromLensblur ? 'from-lensblur' : 'from-file');
          $modalInstance.dismiss();
        },
        function(error) {
          $scope.isDepthmapProcessing = false;
          ga('send', 'event', 'depthmap', 'error', error);
          StateModal.showAlert(error, {stateOptions: {location: 'replace'}});
        }
      );
      // depthy.handleCompoundFile(files[0]);
    }
  });

});

'use strict';

angular.module('depthyApp')
.controller('SharePngModalCtrl', function ($scope, $sce, $timeout, $modalInstance, $state, $q, ga, depthy) {
  var uploadPromise;

  $scope.image = depthy.opened;
  $scope.shareImage = depthy.opened;


  function upload(imageDataUri) {
    ga('send', 'event', 'png', 'upload', '', imageDataUri.length);
    uploadPromise = $.ajax({
      url: 'https://api.imgur.com/3/image.json',
      method: 'POST',
      headers: {
        Authorization: 'Client-ID ' + depthy.imgurId,
        Accept: 'application/json'
      },
      data: {
        image: imageDataUri.substr('data:image/png;base64,'.length),
        type: 'base64',
        name: $scope.image.title,
        title: $scope.image.title + ' #depthy',
        description: 'View this image in 3D on https://depthy.me'
      },
      xhr: function() {
        var xhr = new window.XMLHttpRequest();
        //Upload progress
        xhr.upload.addEventListener('progress', function(evt){
          if (evt.lengthComputable) {
            $scope.uploadProgress = evt.loaded / evt.total;
            $scope.$safeApply();
          }
        }, false);
        return xhr;
      },
    }).done(function(response, status, xhr) {
      console.log(response, status, xhr);
      var id = response.data.id,
          deleteHash = response.data.deletehash;

      if (response.data.type === 'image/png') {
        ga('send', 'event', 'png', 'upload-success');
        $scope.shareImage = $scope.image.createShareImage({
          url: 'https://i.imgur.com/' + id,
          state: 'imgur',
          stateParams: {id: id},
          thumb: 'https://i.imgur.com/' + id + 's.jpg',
          store: depthy.stores.imgur,
          storeUrl: 'https://imgur.com/' + id,
          storeKey: deleteHash
        });

        $scope.share = $scope.image.getShareInfo();

        uploadPromise = null;

        // update description
        $.ajax({
          url: 'https://api.imgur.com/3/image/' + deleteHash,
          method: 'POST',
          headers: {
            Authorization: 'Client-ID ' + depthy.imgurId,
            Accept: 'application/json'
          },
          data: {
            description: 'View this image in 3D on ' + $scope.share.url,
          }
        });
      } else {
        $scope.uploadError = 'This file is too big to upload it to imgur... Sorry :(';
          
        ga('send', 'event', 'png', 'upload-converted');
        $.ajax({
          url: 'https://api.imgur.com/3/image/' + deleteHash,
          method: 'DELETE',
          headers: {
            Authorization: 'Client-ID ' + depthy.imgurId,
            Accept: 'application/json'
          },
        });
      }

      $scope.$safeApply();
    }).fail(function(xhr, status) {
      var response = xhr.responseJSON || {};

      uploadPromise = null;
      $scope.uploadError = (response.data || {}).error || 'Something went wrong... Please try again.';
      console.error('Share failed with ', response);
      ga('send', 'event', 'png', 'upload-error', status + ': ' + $scope.uploadError);
      $scope.$safeApply();
    });

  }


  function generateAndUpload(size, ratio, sizeLimit) {
    size = Math.round(size);
    console.group('Trying PNG size ' + size);
    depthy.getViewer().exportToPNG({width: size, height: size}).then(
      function(dataUrl) {
        console.log('PNG size: ', dataUrl.length);
        console.groupEnd();
        if (dataUrl.length > sizeLimit) {
          if (size > 500) {
            generateAndUpload(size * ratio, ratio, sizeLimit);          
          } else {
            $scope.uploadError = 'This file is too big to upload it to imgur... Sorry :(';
          }
        } else {
          upload(dataUrl);
        }
      }
    );
  }

  $scope.share = $scope.image.getShareInfo();
  if (!$scope.share) {
    // wait for DOM
    $timeout(function() {
      generateAndUpload(850, 0.8, 950000);
    }, depthy.modalWait);
  }



  $modalInstance.result.finally(function() {
    console.log('close');
    if (uploadPromise) uploadPromise.abort();
  });


});

'use strict';

angular.module('depthyApp')
.controller('ExportPngModalCtrl', function ($scope, $sce, $timeout, $window, depthy) {
  $scope.loading = true;
  // wait for animation
  $timeout(function() {
    depthy.getViewer().exportToPNG(null).then(
      function(url) {
        // shorten this!
        url = URL.createObjectURL($window.dataURItoBlob(url));
        var img = angular.element('img[image-source="export-png-modal"]')[0];
        img.onload = function() {
          $scope.loading = false;
          $scope.$safeApply();
        };
        img.src = url;
        angular.element('a[image-source="export-png-modal"]').attr('href', url);
      }
    );
  }, depthy.modalWait);
});

'use strict';

angular.module('depthyApp')
.controller('ExportJpgModalCtrl', function ($scope, $sce, $timeout, $window, depthy) {
  $scope.loading = true;
  // wait for animation
  $timeout(function() {
    var imageUrl, depthUrl, originalUrl;
    depthy.getViewer().exportSourceImage(depthy.opened.imageSource, {quality: 0.9}).then(
      function(url) {
        imageUrl = url;
        return depthy.getViewer().exportDepthmap();
      }
    ).then(
      function(url) {
        depthUrl = url;
        if (depthy.opened.originalSource) {
          return depthy.getViewer().exportSourceImage(depthy.opened.originalSource, {quality: 0.9});
        } else {
          return false;
        }
      }
    ).then(
      function(url) {
        originalUrl = url;
        // ready! let's do this!
        return GDepthEncoder.encodeDepthmap(window.dataURItoArrayBuffer(imageUrl).buffer, depthUrl, originalUrl, {
          'GFocus:BlurAtInfinity': '0.5',
          'GFocus:FocalDistance': '10.0',
          'GFocus:FocalPointX': '0.5',
          'GFocus:FocalPointY': '0.5',
          'GDepth:Format': 'RangeInverse',
          'GDepth:Near': '5.0',
          'GDepth:Far': '20.0',
        });
      }
    ).then(
      function(blob) {
        var url = URL.createObjectURL(blob);
        var img = angular.element('img[image-source="export-jpg-modal"]')[0];
        img.onload = function() {
          $scope.loading = false;
          $scope.$safeApply();
        };
        img.src = url;
        angular.element('a[image-source="export-jpg-modal"]').attr('href', url);
      }
    );

  }, depthy.modalWait);
});

'use strict';

angular.module('depthyApp')
.controller('ExportAnaglyphModalCtrl', function ($scope, $sce, $timeout, $window, depthy) {
  $scope.loading = true;
  // wait for animation
  $timeout(function() {
    depthy.getViewer().exportAnaglyph({}).then(
      function(url) {
        // shorten this!
        url = URL.createObjectURL($window.dataURItoBlob(url));
        var img = angular.element('img[image-source="export-anaglyph-modal"]')[0];
        img.onload = function() {
          $scope.loading = false;
          $scope.$safeApply();
        };
        img.src = url;
        angular.element('a[image-source="export-anaglyph-modal"]').attr('href', url);
      }
    );
  }, depthy.modalWait);
});

/*
MIT Licensed

Copyright (c) 2014 Rafał Lindemann. https://panrafal.github.com/depthy
*/
(function(root){
  'use strict';

  // HELPER FUNCTIONS
  var extend = (root.$ && root.$.extend) || (root._ && root._.extend) || (root.angular && root.angular.extend),
      isNumber = (root.$ && root.$.isNumeric) || (root._ && root._.isNumber) || (root.angular && root.angular.isNumber),
      isMobile = function() {return root.Modernizr && root.Modernizr.isMobile;},
      Promise = (root.Q && root.Q.Promise) || (root.RSVP && root.RSVP.Promise) || root.Promise;

  var defaultOptions = {
      // preferred viewport size {width, height}
      size: null,
      sizeDivisible: 1,
      // auto fitting: false, 'cover', 'contain'. False will disable retina and upscale
      fit: 'contain',
      // allow 2x upscale
      retina: true,
      // maximum upscaling to fit in viewport (through canvas stretching)
      upscale: 1,
      // image enlargment to protect from overflowing edges
      enlarge: 1.06,

      // animation options
      animate: false,
      animateDuration: 2,
      animatePosition: null,
      animateScale: {x: 1, y: 0.5},

      depthScale: 1,
      depthBlurSize: 4,
      depthFocus: 0.5,
      depthPreview: 0,

      easeFactor: isMobile() ? 0.2 : 0.4,

      orient: 2,

      hover: true,
      // element to control mouse movements
      hoverElement: false,

      // 1, 2, 3, 4, 5 or false for auto
      quality: false,
      qualityMin: 1,
      qualityMax: 5,
      qualityStart: isMobile ? 3 : 4,

      alwaysRender: false,
      pauseRender: false,
    };

  var DepthyViewer = root.DepthyViewer = function(element, options) {
    var self = this,
        canvas, stage, renderer, stats,
        image = {}, depth = {},
        sizeDirty = true, stageDirty = true, renderDirty = true, depthFilterDirty = true, 
        discardAlphaFilter, resetAlphaFilter, invertedAlphaToRGBFilter, discardRGBFilter, invertedRGBToAlphaFilter, depthBlurFilter, grayscaleFilter,
        stageSize, stageSizeCPX,
        // renderUpscale = 1.05,
        readyResolver,
        quality = {current: options.qualityStart || 4, dirty: true, provenSlow: {}},

        imageTextureSprite, imageTextureContainer, imageRender,
        depthTextureSprite, depthTextureContainer, depthRender,

        depthFilter, compoundSprite, previewSprite,

        depthOffset = {x: 0, y: 0}, easedOffset = depthOffset;

    options = extend({}, defaultOptions, options || {});

    // PRIVATE FUNCTIONS
    function init() {

      canvas = element.getElementsByTagName('canvas')[0];
      if (!canvas) {
        canvas = element.ownerDocument.createElement('canvas');
        element.appendChild(canvas)
;      }

      initHover();
      initOrient();
      initRenderer();
      
      if (renderer) requestAnimFrame( renderLoop );

    }

    function initHover() {
      var hoverElement = options.hoverElement || element;
      if (typeof(hoverElement) === 'string') hoverElement = element.ownerDocument.querySelector(hoverElement);
      if (!hoverElement) {
        console.warn('Hover element %s not found!', options.hoverElement);
        return;
      }

      hoverElement.addEventListener('mousemove', onHover, false);
      hoverElement.addEventListener('touchmove', onHover, false);
    }

    function onHover(event) {
      if (options.animate || !options.hover || !stageSize || !isReady()) return;
      // todo get rid off jQuery!
      var hoverElement = event.currentTarget,
          size = Math.min(stageSizeCPX.height, stageSizeCPX.width) * 0.9,
          pointerEvent = event.touches ? event.touches[0] : event,
          x = (pointerEvent.pageX - hoverElement.offsetLeft) / hoverElement.offsetWidth,
          y = (pointerEvent.pageY - hoverElement.offsetTop) / hoverElement.offsetHeight;
      x = Math.max(-1, Math.min(1, (x * 2 - 1) * hoverElement.offsetWidth / size));
      y = Math.max(-1, Math.min(1, (y * 2 - 1) *  hoverElement.offsetHeight / size));

      depthOffset = {x: -x, y: -y};
      renderDirty = true;
    }

    function initOrient() {
      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', onMotion);
      } else if (window.DeviceOrientationEvent) {
        console.warn('devicemotion unsupported!');
        window.addEventListener('deviceorientation', onOrientation);
      } else {
        console.warn('deviceorientation unsupported!');
      }
    }

    var lastOrientation;
    function onOrientation(event) {
      if (options.animate || !options.orient || !isReady()) return;
      if (event.beta === null || event.gamma === null) return;

      if (lastOrientation) {
        var portrait = window.innerHeight > window.innerWidth,
            beta = (event.beta - lastOrientation.beta) * 0.2,
            gamma = (event.gamma - lastOrientation.gamma) * 0.2,
            x = portrait ? -gamma : -beta,
            y = portrait ? -beta : -gamma;

        if (x && y) {
          depthOffset = {
            x : Math.max(-1, Math.min(1, depthOffset.x + x)),
            y : Math.max(-1, Math.min(1, depthOffset.y + y))
          };
          renderDirty = true;
        }
        // console.log("offset %d %d ABG %d %d %d", depthOffset.x, depthOffset.y, event.alpha, event.beta, event.gamma)

      }
      lastOrientation = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      };
    }

    function onMotion(event) {
      var rotation = event.rotationRate,
          gravity = event.accelerationIncludingGravity || {}
      if (!rotation) {
        // unsupported :(
        console.warn('devicemotion seems to be unsupported :(', event, rotation);
        window.removeEventListener('devicemotion', onMotion);
        window.addEventListener('deviceorientation', onOrientation);
        return;
      }
      if (options.animate || !options.orient || !isReady()) return;
      var rate = (Modernizr.chrome && !Modernizr.ios ? 1 : 0.005) / options.orient, // Chrome doesn't give angle per second
          portrait = window.innerHeight > window.innerWidth,
          x = (portrait ? rotation.beta : rotation.alpha) * -rate,
          y = (portrait ? rotation.alpha : -rotation.beta) * -rate;

      // detect flipped orientation
      if (Math.abs(gravity.z) < 9 && (portrait ? gravity.y : gravity.x) < 0) {
        x *= -1;
        y *= -1;
      }

      if (x && y) {
        depthOffset = {
          x : Math.max(-1, Math.min(1, depthOffset.x + x)),
          y : Math.max(-1, Math.min(1, depthOffset.y + y))
        };
        renderDirty = true;
      }
    }

    function initRenderer() {

      stage = new PIXI.Stage();
      try {
        renderer = new PIXI.WebGLRenderer(800, 600, canvas, false, true);

        discardAlphaFilter = createDiscardAlphaFilter();
        resetAlphaFilter = createDiscardAlphaFilter(1.0);
        invertedAlphaToRGBFilter = createInvertedAlphaToRGBFilter();
        discardRGBFilter = createDiscardRGBFilter();
        invertedRGBToAlphaFilter = createInvertedRGBToAlphaFilter();
        depthBlurFilter = createDepthBlurFilter();
        grayscaleFilter = createGrayscaleFilter();
      } catch (e) {
        console.error('WebGL failed', e);
        renderer = false;
        if (Modernizr) Modernizr.webgl = false;
      }

    }


    function createDiscardAlphaFilter(alphaConst) {
      var filter = new PIXI.ColorMatrixFilter2();
      filter.matrix = [1.0, 0.0, 0.0, 0.0,
                       0.0, 1.0, 0.0, 0.0,
                       0.0, 0.0, 1.0, 0.0,
                       0.0, 0.0, 0.0, 0.0];
      filter.shift =  [0.0, 0.0, 0.0, alphaConst || 0.0];
      return filter;
    }

    function createDiscardRGBFilter() {
      var filter = new PIXI.ColorMatrixFilter2();
      filter.matrix = [0.0, 0.0, 0.0, 0.0,
                       0.0, 0.0, 0.0, 0.0,
                       0.0, 0.0, 0.0, 0.0,
                       0.0, 0.0, 0.0, 1.0];
      filter.shift =  [0.0, 0.0, 0.0, 0.0];
      return filter;
    }

    function createInvertedAlphaToRGBFilter() {
      // move inverted alpha to rgb, set alpha to 1
      var filter = new PIXI.ColorMatrixFilter2();
      filter.matrix = [0.0, 0.0, 0.0,-1.0,
                       0.0, 0.0, 0.0,-1.0,
                       0.0, 0.0, 0.0,-1.0,
                       0.0, 0.0, 0.0, 0.0];
      filter.shift =  [1.0, 1.0, 1.0, 1.0];
      return filter;
    }

    function createInvertedRGBToAlphaFilter() {
      // move inverted alpha to rgb, set alpha to 1
      var filter = new PIXI.ColorMatrixFilter2();
      filter.matrix = [0.0, 0.0, 0.0, 0.0,
                       0.0, 0.0, 0.0, 0.0,
                       0.0, 0.0, 0.0, 0.0,
                      -1.0, 0.0, 0.0, 0.0];
      filter.shift =  [0.0, 0.0, 0.0, 1.0];
      return filter;
    }

    function createGrayscaleFilter() {
      // move inverted alpha to rgb, set alpha to 1
      var filter = new PIXI.ColorMatrixFilter();
      filter.matrix = [0.333, 0.333, 0.333, 0.0,
                       0.333, 0.333, 0.333, 0.0,
                       0.333, 0.333, 0.333, 0.0,
                       0.0, 0.0, 0.0, 1.0];
      return filter;
    }

    function createDepthBlurFilter() {
      return new PIXI.BlurFilter();
    }

    function sizeCopy(size, expand) {
      expand = expand || 1;
      return {width: size.width * expand, height: size.height * expand};
    }

    function sizeFit(size, max, cover) {
      var ratio = size.width / size.height;
      size = sizeCopy(size);
      if (cover && size.height < max.height || !cover && size.height > max.height) {
        size.height = max.height;
        size.width = size.height * ratio;
      }
      if (cover && size.width < max.width || !cover && size.width > max.width) {
        size.width = max.width;
        size.height = size.width / ratio;
      }
      return size;
    }

    function sizeRound(size) {
      return {
        width: Math.round(size.width),
        height: Math.round(size.height)
      };
    }

    function sizeFitScale(size, max, cover) {
      if (cover) {
        return max.width / max.height > size.width / size.height ?
          max.width / size.width :
          max.height / size.height;
      } else {
        return max.width / max.height > size.width / size.height ?
          max.height / size.height :
          max.width / size.width;
      }
    }

    function isReady() {
      return !!(renderer !== false && image.texture && image.size && (!depth.texture || depth.size));
    }

    // true when image and depth use the same texture...
    function isTextureShared() {
      return image.texture && depth.texture && image.texture === depth.texture;
    }

    function hasImage() {
      return !!image.texture;
    };

    function hasDepthmap() {
      return !!depth.texture;
    };


    function changeTexture(old, source) {
      if ((old.texture === source)|| old.url === source) return old;
      var current = {
        dirty: true
      };
      current.promise = new Promise(function(resolve, reject) {
        if (source) {
          if (source instanceof PIXI.RenderTexture) {
            current.texture = source;
          } else {
            current.texture = PIXI.Texture.fromImage(source);
            current.url = source;
          }
          current.texture.baseTexture.premultipliedAlpha = false;
          if (current.texture.baseTexture.hasLoaded) {
            current.size = current.texture.frame;
            sizeDirty = true;
            resolve(current);
          } else {
            current.texture.addEventListener('update', function() {
              if (!current.texture) return;
              current.size = current.texture.frame;
              sizeDirty = true;
              resolve(current);
            });
            current.texture.baseTexture.source.onerror = function(error) {
              if (!current.texture) return;
              console.error('Texture load failed', error);
              current.error = true;
              current.texture.destroy(true);
              delete current.texture;
              reject(error);
            };
          }
        } else {
          console.log('Empty texture!');
          resolve(current);
        }
        // free up mem...
        if (old) {
          if (old.texture && !isTextureShared() && !old.shared) {
            old.texture.destroy(true);
          }
          old.texture = null;
        }
      });
      return current;
    }


    function updateSize() {
      var maxSize = sizeCopy(image.size, (options.fit && options.upscale) || 1);

      stageSize = sizeCopy(maxSize);

      // preferred size
      if (options.size) {
        stageSize = sizeFit(stageSize, options.size);
        if (options.fit === 'cover') {
          stageSize = sizeFit(stageSize, options.size, true);
          stageSize = sizeFit(stageSize, maxSize);
          // 
          if (stageSize.height > options.size.height) stageSize.height = options.size.height;
          if (stageSize.width > options.size.width) stageSize.width = options.size.width;
        }
      }

      // console.log('Image %dx%d Stage %dx%d View %dx%d', image.size.width, image.size.height, stageSize.width, stageSize.height, options.size.width, options.size.height);

      // remember target size
      stageSizeCPX = sizeRound(stageSize);

      // retina
      if (options.retina && options.fit && window.devicePixelRatio >= 2) {
        stageSize.width *= 2;
        stageSize.height *= 2;
      }

      // don't upscale the canvas beyond image size
      stageSize = sizeFit(stageSize, image.size);
      stageSize = sizeRound(stageSize);

      if (options.sizeDivisible > 1) {
        stageSize.width -= stageSize.width % options.sizeDivisible;
        stageSize.height -= stageSize.height % options.sizeDivisible;
      }
      // console.log('Stage %dx%d StageCPX %dx%d', stageSize.width, stageSize.height, stageSizeCPX.width, stageSizeCPX.height);

      canvas.style.width = stageSizeCPX.width + 'px';
      canvas.style.height = stageSizeCPX.height + 'px';
      canvas.style.marginLeft = Math.round(stageSizeCPX.width / -2) + 'px';
      canvas.style.marginTop = Math.round(stageSizeCPX.height / -2) + 'px';

      if (renderer && (renderer.width !== stageSize.width || renderer.height !== stageSize.height)) {
        renderer.resize(stageSize.width, stageSize.height);
        image.dirty = depth.dirty = true;
        stageDirty = true;
      }

      sizeDirty = false;
    }

    function updateImageTexture() {
      var scale = sizeFitScale(image.size, stageSize, true);

      // prepare image render
      imageTextureSprite = new PIXI.Sprite(image.texture);
      imageTextureSprite.scale = new PIXI.Point(scale, scale);

      imageTextureSprite.anchor = {x: 0.5, y: 0.5};
      imageTextureSprite.position = {x: stageSize.width / 2, y: stageSize.height / 2};

      // discard alpha channel
      imageTextureSprite.filters = [discardAlphaFilter];

      imageTextureContainer = new PIXI.DisplayObjectContainer();
      imageTextureContainer.addChild(imageTextureSprite);

      if (imageRender && (imageRender.width !== stageSize.width || imageRender.height !== stageSize.height)) {
        // todo: pixi errors out on this... why?
        // imageRender.resize(stageSize.width, stageSize.height);
        imageRender.destroy(true);
        imageRender = null;
      }
      imageRender = imageRender || new PIXI.RenderTexture(stageSize.width, stageSize.height);
      
      image.dirty = false;
      image.renderDirty = stageDirty = true;
    }

    function renderImageTexture() {
      imageRender.render(imageTextureContainer, null, true);
      image.renderDirty = false;
      renderDirty = true;
    }

    function updateDepthTexture() {
      var scale = depth.size ? sizeFitScale(depth.size, stageSize, true) : 1;

      depthTextureContainer = new PIXI.DisplayObjectContainer();

      if (hasDepthmap()) {
        // prepare depth render / filter
        depthTextureSprite = new PIXI.Sprite(depth.texture);
        depthTextureSprite.filters = [depthBlurFilter];
        depthTextureSprite.scale = new PIXI.Point(scale, scale);
        depthTextureSprite.renderable = !!depth.texture;

        depthTextureSprite.anchor = {x: 0.5, y: 0.5};
        depthTextureSprite.position = {x: stageSize.width / 2, y: stageSize.height / 2};

        if (depth.useAlpha) {
          // move inverted alpha to rgb, set alpha to 1
          depthTextureSprite.filters.push(invertedAlphaToRGBFilter);
          depthTextureSprite.filters = depthTextureSprite.filters;
        }
        depthTextureContainer.addChild(depthTextureSprite);
      } else {
        depthTextureSprite = null;
      }


      if (depthRender && (depthRender.width !== stageSize.width || depthRender.height !== stageSize.height)) {
        depthRender.destroy(true);
        depthRender = null;
      }
      depthRender = depthRender || new PIXI.RenderTexture(stageSize.width, stageSize.height);

      depth.dirty = false;
      depth.renderDirty = stageDirty = true;
    }

    function renderDepthTexture() {
      depthBlurFilter.blur = options.depthBlurSize;
      depthRender.render(depthTextureContainer, null, true);
      depth.renderDirty = false;
      renderDirty = true;
    }


    var depthFiltersCache = {};
    function updateStage() {
      // combine image with depthmap
      var q = options.quality || quality.current;
      if (!depthFilter || depthFilter.quality !== q) {
        depthFiltersCache[q] = depthFilter = depthFiltersCache[q] || 
            (q === 1 ? new PIXI.DepthDisplacementFilter(depthRender)
                    : new PIXI.DepthPerspectiveFilter(depthRender, q));
        depthFilter.quality = q;
        // depthFilter = new PIXI.DepthDisplacementFilter(depthRender);
      }
      if (depthFilter.map !== depthRender) {
        depthFilter.map = depthRender;
      }

      if (compoundSprite) {
        stage.removeChild(compoundSprite);
      }

      compoundSprite = new PIXI.Sprite(imageRender);
      compoundSprite.filters= [depthFilter];

      stage.addChild(compoundSprite);

      if (previewSprite) stage.removeChild(previewSprite);
      previewSprite = new PIXI.Sprite(depthRender);
      stage.addChild(previewSprite);

      stageDirty = false;
      renderDirty = depthFilterDirty = true;
      quality.dirty = true;
    }

    function updateDepthFilter() {
      depthFilter.scale = 0.02 * (options.depthScale);

      depthFilter.offset = {
        x : easedOffset.x || 0,
        y : easedOffset.y || 0
      };
      depthFilter.focus = options.depthFocus;
      depthFilter.enlarge = options.enlarge;

      previewSprite.visible = options.depthPreview != 0;
      previewSprite.alpha = options.depthPreview;

      depthFilterDirty = false;
      renderDirty = true;
    }

    function updateOffset() {
      if (depthOffset.x !== easedOffset.x || depthOffset.y !== easedOffset.y) {
        
        if (options.easeFactor && !options.animate) {
          easedOffset.x = easedOffset.x * options.easeFactor + depthOffset.x * (1-options.easeFactor);
          easedOffset.y = easedOffset.y * options.easeFactor + depthOffset.y * (1-options.easeFactor);
          if (Math.abs(easedOffset.x - depthOffset.x) < 0.0001 && Math.abs(easedOffset.y - depthOffset.y) < 0.0001) {
            easedOffset = depthOffset;
          }
        } else {
          easedOffset = depthOffset;
        }

        depthFilter.offset = {
          x : easedOffset.x,
          y : easedOffset.y
        };

        renderDirty = true;
      }

    }

    function updateAnimation() {
      if (options.animate) {
        var now = isNumber(options.animatePosition) ?
                    options.animatePosition * options.animateDuration * 1000
                    : (window.performance && window.performance.now ? window.performance.now() : new Date().getTime());
        depthFilter.offset = {
          x : Math.sin(now * Math.PI * 2 / options.animateDuration / 1000) * options.animateScale.x,
          y : Math.cos(now * Math.PI * 2 / options.animateDuration / 1000) * options.animateScale.y
        };

        renderDirty = true;
      }
    }

    function changeQuality(q) {
      quality.measured = true;
      q = Math.max(options.qualityMin, Math.min(options.qualityMax, q));
      if (q !== quality.current) {
        if (q > quality.current && quality.provenSlow[q] && stageSize.width * stageSize.height >= quality.provenSlow[q]) {
          console.warn('Quality %d proven to be slow for size %d >= %d at %d', q, stageSize.width * stageSize.height, quality.provenSlow[q], quality.avg);
            myDone();
        } else {
          console.warn('Quality change %d -> %d at %d fps', quality.current, q, quality.avg);
          quality.current = q;
          stageDirty = true;
        }
      } else {
        console.warn('Quality %d is ok at %d fps', q, quality.avg);
          myDone();
      }
      updateDebug();
    }

    function updateQuality() {
      if (!hasDepthmap() || !hasImage() || options.quality) return;
      if (quality.dirty) {
        console.log('Quality reset');
        quality.count = quality.slow = quality.fast = quality.sum = 0;
        quality.measured = false;
        quality.dirty = false;
        updateDebug();
      }
      quality.count++;
      quality.fps = 1000 / quality.ms;
      quality.sum += quality.fps;
      quality.avg = quality.sum / quality.count;
      if (quality.fps < 10) { // 20fps
        quality.slow++;
      } else if (quality.fps > 58) { // 50fps
        quality.fast++;
      }
      
      // console.log('Quality ', quality);

      if (quality.slow > 5 || (quality.count > 15 && quality.avg < (quality.current > 4 ? 55 : 25))) {
        // quality 5 is slow below 55
        // log this stagesize as slow...
        if (!options.quality) quality.provenSlow[quality.current] = stageSize.width * stageSize.height;
        changeQuality(quality.current - 1);
      } else if (/*quality.fast > 30 ||*/ quality.count > 40 && quality.avg > (quality.current > 3 ? 55 : 50)) {
        // quality 4 is fast above 55
        // log this 
        changeQuality(quality.current + 1);
      } else if (quality.count > 60) {
        changeQuality(quality.current);
      } else {
        // render a bit more please...
        renderDirty = true;
      }
    }

    function updateDebug() {
      if (stats) {
        stats.domElement.className = 'q' + quality.current + (quality.measured ? '' : ' qm');
        stats.infoElement.textContent = 'Q' + (options.quality || quality.current) + (quality.measured ? '' : '?') + ' <' + quality.slow + ' >' + quality.fast + ' n' + quality.count + ' ~' + Math.round(quality.avg);
      }
    }

    function renderStage() {
      renderer.render(stage);
      renderDirty = false;
    }

    function update() {
      if (sizeDirty) updateSize();

      if (image.dirty) updateImageTexture();
      if (image.renderDirty) renderImageTexture();

      if (depth.dirty) updateDepthTexture();
      if (depth.renderDirty) renderDepthTexture();

      if (stageDirty) updateStage();
      if (depthFilterDirty) updateDepthFilter();

      if (hasDepthmap()) {
        updateOffset();
        updateAnimation();
      }

      if (readyResolver) {
        readyResolver();
        readyResolver = null;
      }
    }

    function render() {
      if (!isReady()) return;

      update();

      if (renderDirty || options.alwaysRender) {
        renderStage();
      }

      if (quality.dirty || !quality.measured) {
        updateQuality();
      }
      
    }

    var lastLoopTime = 0;
    function renderLoop() {
      if (!options.pauseRender) {
        quality.ms = lastLoopTime && (performance.now() - lastLoopTime);
        lastLoopTime = performance.now();

        stats && stats.begin();
        render();
        stats && stats.end();
      }
      requestAnimFrame( renderLoop );
    }

    // PUBLIC FUNCTIONS

    this.setOptions = function(newOptions) {
      for(var k in newOptions) {
        if (options[k] === newOptions[k]) continue;
        options[k] = newOptions[k];
        switch(k) {
          case 'size':
          case 'fit':
          case 'retina':
          case 'upscale':
            sizeDirty = true;
            break;
          case 'quality':
            stageDirty = true;
            updateDebug();
            break;
          case 'depthScale':
          case 'depthFocus':
          case 'depthPreview':
            depthFilterDirty = true;
            break;
          case 'depthBlurSize':
            depth.renderDirty = true;
            break;
          default:
            renderDirty = true;
        }
      }
    };

    this.getOptions = function() {
      var oc = {};
      for(var k in options) oc[k] = options[k];
      return oc;
    };

    this.getElement = function() {
      return element;
    };

    this.getCanvas = function() {
      return canvas;
    };

    this.getRenderer = function() {
      return renderer;
    };

    this.getSize = function() {
      return sizeCopy(stageSize);
    };

    this.getSizeCPX = function() {
      return sizeCopy(stageSizeCPX);
    };

    this.getQuality = function() {
      return quality.current;
    };

    /** Returns a promise resolved when the viewer is ready, or rejected when any of the images are missing or failed on load.
        @param resolvedOnly TRUE - only wait for the isReady() to become true. Otherwise, the promise may be rejected
               but will be reset every time you change any of the images.
     */
    this.getPromise = function(resolvedOnly) {
      if (!resolvedOnly && (!this.hasImage() || this.getLoadError())) {
        return Promise.reject();
      }
      if (isReady()) {
        return Promise.resolve();
      }
      if (!readyResolver) {
        var promise = new Promise(function(resolve) {
          readyResolver = resolve;
        });
        readyResolver.promise = promise;
      }
      return resolvedOnly ? readyResolver.promise : Promise.all( [image.promise, depth.promise, readyResolver.promise] );
    };

    this.setImage = function(source) {
      image = changeTexture(image, source);
      return image.promise;
    };

    this.getImage = function() {
      return image;
    };

    this.setDepthmap = function(source, useAlpha) {
      depth = changeTexture(depth, source);
      depth.useAlpha = !!useAlpha;
      return depth.promise;
    };

    this.getDepthmap = function() {
      return depth;
    };

    this.render = render;

    this.reset = function() {
      this.setImage();
      this.setDepthmap();
    };

    this.hasImage = hasImage;

    this.hasDepthmap = hasDepthmap;

    this.getLoadError = function() {
      return image.error || depth.error;
    };

    this.setOffset = function(offset) {
      depthOffset = offset;
    };

    this.screenToImagePos = function(pos, clamp) {
      var rect = canvas.getBoundingClientRect();
      pos = {x: pos.x, y: pos.y};
      pos.x = (pos.x - rect.left) / rect.width;
      pos.y = (pos.y - rect.top) / rect.height;
      if (clamp) {
        pos.x = Math.max(0, Math.min(1, pos.x));
        pos.y = Math.max(0, Math.min(1, pos.y));
      }
      return pos;
    };

    /** Exports image + depthmap as PNG file. Returns promise */
    this.exportToPNG = function(maxSize) {

      return this.getPromise().then(
        function() {
          if (!hasDepthmap()) return false;

          var size = sizeRound(sizeFit(image.size, maxSize || image.size)),
              localstage = new PIXI.Stage(),
              scale = size.width / image.size.width,
              depthScale = size.width / depth.size.width,
              // we need unmultiplied canvas for this... 
              // it uploads images to the GPU once again, and won't work with local textures, but... well...
              localrenderer = new PIXI.WebGLRenderer(size.width, size.height, null, 'notMultiplied', true);

          var imageSprite = new PIXI.Sprite(image.texture);
          imageSprite.scale = new PIXI.Point(scale, scale);
          localstage.addChild(imageSprite);

          // discard alpha channel
          imageSprite.filters = [createDiscardAlphaFilter()];
          console.log(depth.texture);
          var depthSprite = new PIXI.Sprite(depth.texture);
          depthSprite.scale = new PIXI.Point(depthScale, depthScale);
          depthSprite.filters = [depth.useAlpha ? createDiscardRGBFilter() : createInvertedRGBToAlphaFilter()];

          // copy alpha using custom blend mode
          PIXI.blendModesWebGL['one.one'] = [localrenderer.gl.ONE, localrenderer.gl.ONE];
          depthSprite.blendMode = 'one.one';

          localstage.addChild(depthSprite);

          localrenderer.render(localstage);
          var dataUrl = localrenderer.view.toDataURL('image/png');

          try {
            localrenderer.destroy();
          } catch(e) {
            console.error('Render destroy error', e);
          }
          return dataUrl;
        }
      );
    };


    function exportTexture(source, options) {
      return source.promise.then(
        function() {
          if (!source.texture) {
            return false;
          } else if (options.allowDirect && source.url) {
            return source.url;
          } else {
            var size = sizeCopy(options.size || source.size);
            if (options.maxSize) size = sizeFit(size, options.maxSize);
            if (options.minSize) size = sizeFit(size, options.minSize, true);
            size = sizeRound(size);

            var localstage = new PIXI.Stage(),
                scale = sizeFitScale(source.size, size, true),
                renderTexture = new PIXI.RenderTexture(size.width, size.height);

            var sourceSprite = new PIXI.Sprite(source.texture);
            if (options.filters) sourceSprite.filters = options.filters;
            sourceSprite.scale = new PIXI.Point(scale, scale);
            sourceSprite.anchor = {x: 0.5, y: 0.5};
            sourceSprite.position = {x: size.width / 2, y: size.height / 2};

            localstage.addChild(sourceSprite);

            renderTexture.render(localstage, null, true);
            var canvas = PIXI.glReadPixelsToCanvas(renderer.gl, renderTexture, 0, 0, renderTexture.width, renderTexture.height),
                dataUrl = canvas.toDataURL(options.type || 'image/jpeg', options.quality || undefined);

            try {
              renderTexture.destroy();
            } catch(e) {
              console.error('Render destroy error', e);
            }
            return dataUrl;
          }
        }
      );
    }

    /** Exports depthmap as is, or converts it to JGP. Returns promise */
    this.exportDepthmap = function(options) {
      return exportTexture(depth, extend({
        // allowDirect: !depth.useAlpha,
        filters: depth.useAlpha ? [invertedAlphaToRGBFilter] : [grayscaleFilter],
      }, options));
    };

    this.exportImage = function(options) {
      return exportTexture(image, extend({
        filters: [resetAlphaFilter]
      }, options));
    };

    this.exportSourceImage = function(source, options) {
      source = changeTexture({}, source);
      return exportTexture(source, extend({
        filters: [resetAlphaFilter]
      }, options));
    };

    this.exportDepthmapAsTexture = function(maxSize) {
      var size = sizeCopy(image.size);
      if (maxSize) size = sizeFit(size, maxSize);
      size = sizeRound(size);

      var texture = new PIXI.RenderTexture(size.width, size.height);

      var container = new PIXI.DisplayObjectContainer();
      if (hasDepthmap()) {
        var scale = sizeFitScale(depth.size, size, true);
        
        var sprite = new PIXI.Sprite(depth.texture);
        sprite.scale = new PIXI.Point(scale, scale);
        sprite.anchor = {x: 0.5, y: 0.5};
        sprite.position = {x: size.width / 2, y: size.height / 2};
        if (depth.useAlpha) {
          sprite.filters = [invertedAlphaToRGBFilter];
        } else {
          sprite.filters = [grayscaleFilter];
        }
        container.addChild(sprite);
      } else {
        // flat is in the back
        var graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF, 1);
        graphics.drawRect(0, 0, size.width, size.height);
        container.addChild(graphics);
      }

      texture.render(container, null, true);
      return texture;
    };

    /** Exports thumbnail as JPG file. Returns promise */
    this.exportThumbnail = function(size, quality) {
      size = size || {width: 50, height: 50};
      return this.getPromise().then(
        function() {
          var localstage = new PIXI.Stage(),
              scale = sizeFitScale(image.size, size, true),
              renderTexture = new PIXI.RenderTexture(size.width, size.height);

          var imageSprite = new PIXI.Sprite(image.texture);
          imageSprite.scale = new PIXI.Point(scale, scale);
          imageSprite.anchor = {x: 0.5, y: 0.5};
          imageSprite.position = {x: size.width / 2, y: size.height / 2};
          localstage.addChild(imageSprite);

          // discard alpha channel
          imageSprite.filters = [resetAlphaFilter];

          renderTexture.render(localstage, null, true);
          var canvas = PIXI.glReadPixelsToCanvas(renderer.gl, renderTexture, 0, 0, renderTexture.width, renderTexture.height),
              dataUrl = canvas.toDataURL('image/jpeg', quality);


          try {
            renderTexture.destroy();
          } catch(e) {
            console.error('Render destroy error', e);
          }
          return dataUrl;
        }
      );
    };

    this.exportAnaglyph = function(exportOpts) {
      return this.getPromise().then(
        function() {

          var size = sizeCopy(exportOpts.size || image.size);
          if (exportOpts.maxSize) size = sizeFit(size, exportOpts.maxSize);
          if (exportOpts.minSize) size = sizeFit(size, exportOpts.minSize, true);
          size = sizeRound(size);

          var oldOptions = self.getOptions();

          self.setOptions({
            animate: false,
            size: size,
            fit: false,
            orient: false,
            hover: false,
            depthPreview: 0,
            quality: 5,
          });

          // enforce settings
          update();

          var localstage = new PIXI.Stage(),
              leftEye, rightEye, filter;

          leftEye = compoundSprite;
          depthFilter.offset = {x: -1, y: 0.5};
          filter = new PIXI.ColorMatrixFilter2();
          filter.matrix = [1.0, 0.0, 0.0, 0.0,
                           0.0, 0.0, 0.0, 0.0,
                           0.0, 0.0, 0.0, 0.0,
                           0.0, 0.0, 0.0, 1.0];
          leftEye.filters.push(filter);
          leftEye.filters = leftEye.filters;
          localstage.addChild(leftEye);

          // right eye
          compoundSprite = null;
          depthFilter = new PIXI.DepthPerspectiveFilter(depthRender, options.quality); // independent copy
          depthFilter.quality = options.quality; // enforce it
          updateStage(); // recreate sprite
          updateDepthFilter();

          rightEye = compoundSprite;
          depthFilter.offset = {x: 1, y: 0.5};
          filter = new PIXI.ColorMatrixFilter2();
          filter.matrix = [0.0, 0.0, 0.0, 0.0,
                           0.0, 1.0, 0.0, 0.0,
                           0.0, 0.0, 1.0, 0.0,
                           0.0, 0.0, 0.0, 1.0];
          rightEye.filters.push(filter);
          rightEye.filters = rightEye.filters;

          PIXI.blendModesWebGL['one.one'] = [renderer.gl.ONE, renderer.gl.ONE];
          rightEye.blendMode = 'one.one';

          // rightEye.blendMode = PIXI.blendModes.NORMAL;
          localstage.addChild(rightEye);

          // render...
          renderer.render(localstage);
          // store
          var dataUrl = canvas.toDataURL('image/jpeg', exportOpts.quality || 0.9);

          // done!
          compoundSprite = null;
          depthFilter = null;

          self.setOptions(oldOptions);
          // make full render cycle
          render();

          return dataUrl;
        }
      );
    };

    this.enableDebug = function() {
      if (window.Stats) {
        stats = new window.Stats();
        stats.setMode(0); // 0: fps, 1: ms
        stats.infoElement = document.createElement( 'div' );
        stats.infoElement.className = 'info';
        stats.domElement.appendChild(stats.infoElement);
        document.body.appendChild( stats.domElement );
        updateDebug();
      }
    };

    this.isReady = isReady;

    // STARTUP

    init();

  };

  DepthyViewer.defaultOptions = defaultOptions;

})(window);

/*
MIT Licensed

Copyright (c) 2014 Rafał Lindemann. https://panrafal.github.com/depthy
*/
(function(root){
  'use strict';

  var DepthyDrawer = root.DepthyDrawer = function(viewer) {

    var self = this,
        texture, undoTexture,
        lastUndoTime, redoMode = false,
        brush, brushCanvas, brushTexture, brushContainer, brushLastPos, brushDirty,
        options,
        renderer = viewer.getRenderer(),
        depthmap = viewer.getDepthmap(),
        image = viewer.getImage(),
        modified = false, canceled = false,
        unit;

    options = {
      depth: 0.5,
      size: 0.02,
      hardness: 0.0,
      opacity: 1.0,
      spacing: 0.1,
      slope: 0.5,
      blend: PIXI.blendModes.NORMAL,
      undoTimeout: 2000,
    };

    function initialize() {

      // always start with a new one...
      if (true || depthmap.texture instanceof PIXI.RenderTexture === false) {
        // replace the texture
        viewer.setDepthmap(viewer.exportDepthmapAsTexture({width: 1000, height: 1000}));
        depthmap = viewer.getDepthmap();
      }

      texture = depthmap.texture;

      unit = Math.max(image.size.width, image.size.height);

      // setup undo...
      // undoTexture = new PIXI.RenderTexture(texture.width, texture.height);

      // setup brush
      brushCanvas = document.createElement('canvas');
      // brushCanvas.id = 'draw-brushcanvas';
      // viewer.getElement().appendChild(brushCanvas);
      brushDirty = true;
    }

    function updateBrush() {

      var ctx = brushCanvas.getContext('2d'),
          depth = options.depth,
          size = options.size * unit,
          hardness = Math.max(0, Math.min(0.99, options.hardness))
          
      brushCanvas.width = brushCanvas.height = size;
      ctx.clearRect(0, 0, size, size);


      var grd = ctx.createRadialGradient(size / 2, size / 2, size / 2 * hardness, size / 2, size / 2, size / 2),
          color = Math.round((depth) * 0xFF)
      grd.addColorStop(0, 'rgba(' + color + ',' + color + ',' + color + ',' + options.opacity + ')');
      grd.addColorStop(options.slope, 'rgba(' + color + ',' + color + ',' + color + ',' + (0.5 * options.opacity) + ')');
      grd.addColorStop(1, 'rgba(' + color + ',' + color + ',' + color + ',0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, size, size);

      // console.log('updateBrush!', options, color, grd);

      if (!brushTexture) {
        brushTexture = PIXI.Texture.fromCanvas(brushCanvas);
      } else {
        brushTexture.width = brushTexture.height = size;
        // PIXI.texturesToUpdate.push(brushTexture.baseTexture);
        PIXI.updateWebGLTexture(brushTexture.baseTexture, renderer.gl);
      }
      if (!brush) {
        brushContainer = new PIXI.DisplayObjectContainer();
        brush = new PIXI.Sprite(brushTexture);
        brush.anchor.x = 0.5;
        brush.anchor.y = 0.5;
        brushContainer.addChild(brush);
      }
      brush.width = brush.height = size;
      brushDirty = false;
    }

    function throttledStoreUndo(force) {
      if (force || redoMode || !lastUndoTime || new Date() - lastUndoTime > options.undoTimeout) {
        storeUndo();
      }
      lastUndoTime = new Date();
    }

    function storeUndo() {
      if (!undoTexture) {
        undoTexture = new PIXI.RenderTexture(texture.width, texture.height);
      }
      console.log('Undo stored!');
      redoMode = false;
      var sprite = new PIXI.Sprite(texture);
      undoTexture.render(sprite, null, true);
    }

    function toggleUndo() {
      if (!undoTexture) return;
      
      var tmp = undoTexture;
      undoTexture = texture;
      texture = tmp;
      redoMode = !redoMode;

      console.log('Toggle undo!', texture);

      depthmap.shared = true; // won't be destroyed
      viewer.setDepthmap(texture);
      depthmap = viewer.getDepthmap();
    }

    this.setOptions = function(newOptions) {
      for(var k in newOptions) {
        if (options[k] === newOptions[k]) continue;
        options[k] = newOptions[k];
        switch(k) {
          case 'depth':
          case 'size':
          case 'hardness':
          case 'opacity':
          case 'spacing':
          case 'slope':
            brushDirty = true;
            break;
        }
      }
    }

    this.getOptions = function() {
      var oc = {};
      for(var k in options) oc[k] = options[k];
      return oc;
    };    

    /* -1 undo, 1 redo, 0 no history */
    this.getUndoMode = function() {
      return redoMode ? 1 : undoTexture ? -1 : 0;
    }

    this.toggleUndo = toggleUndo;

    this.drawBrush = function(pos) {
      if (brushDirty) updateBrush();
      throttledStoreUndo();
      brushLastPos = {x: pos.x, y: pos.y};
      brush.x = pos.x * depthmap.size.width;
      brush.y = pos.y * depthmap.size.height;
      // brush.alpha = options.opacity;
      brush.blendMode = options.blend;
      // console.log('Draw', brush.x, brush.y);
      texture.render(brushContainer, null, false);
      depthmap.renderDirty = true;
      modified = true;
    };

    this.drawBrushTo = function(pos) {
      var from = {x: brushLastPos.x, y: brushLastPos.y},
          to = pos,
          dst = Math.sqrt(Math.pow((to.x - from.x) * depthmap.size.width, 2) + Math.pow((to.y - from.y) * depthmap.size.height, 2)),
          step = Math.round(Math.max(1, options.spacing * options.size * unit)),
          steps = dst / step;
      // console.log(dst, step, steps/*, from, to*/);
      for (var i = 1; i <= steps; ++i) {
        var prg = i / steps;
        this.drawBrush({x: from.x + (to.x - from.x) * prg, y: from.y + (to.y - from.y) * prg});
      }
    };

    this.getDepthAtPos = function(pos) {
      return PIXI.glReadPixels(renderer.gl, texture, pos.x * depthmap.size.width, pos.y * depthmap.size.height, 1, 1)[0] / 255;
    };

    this.isModified = function() {
      return modified;
    };

    this.isCanceled = function() {
      return canceled;
    };

    this.cancel = function() {
      canceled = true;
    };

    this.destroy = function(destroyTexture) {
      if (undoTexture) undoTexture.destroy();
      if (brushTexture) brushTexture.destroy();
      if (destroyTexture && texture) texture.destroy();
      depthmap.shared = false;
    };

    initialize();
  };

})(window);
'use strict';

angular.module('depthyApp')
.service('StateModal', function StateModal($rootScope, $modal, $state, $location, $window, $q) {

  /** Changes $state to show a modal...
  Returns deffered which will go back in history if rejected, or replace the location if resolved.
  Back buttons will reject the promise. */
  this.stateDeferred = function(state, options) {
    options = options || {};
    var deferred = $q.defer(), deregister;
    deferred.state = state;

    // if ($state.current.name === state) state = false;
    if (state && !options.stateCurrent && state !== true) $state.go(state, options.stateParams, options.stateOptions);

    deferred.promise.then(
      function() {
        if (deregister) deregister();
        if (state && $state.current.name === state) $location.replace();
      },
      function() {
        if (deregister) deregister();
        if (state && $state.current.name === state) $window.history.back();
      }
    );

    if (state) {
      deregister = $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
        deregister();
        deregister = null;
        if (state === true || fromState.name === state) {
          state = false;
          deferred.reject();
        }
      });
    }
    return deferred;
  };

  this.showModal = function(state, options) {
    var deferred = this.stateDeferred(state, options),
        modal;

    modal = $modal.open(options || {});

    modal.result.then(
      function() {
        deferred.resolve();
      },
      function() {
        deferred.reject();
      }
    );

    deferred.promise.finally(function() {
      modal.close();
    });

    return modal;
  };

  this.showAlert = function(message, options, state) {
    return this.showModal(state || 'alert', angular.extend({
      templateUrl: 'views/alert-modal.html',
      windowClass: 'alert-modal',
      scope: angular.extend($rootScope.$new(), {message: message}),
    }, options || {}));
  };


});

'use strict';

angular.module('depthyApp')
.service('UpdateCheck', function UpdateCheck($window, $q) {
    
  this.check = function(update) {
    var appCache = $window.applicationCache;
    if (!appCache) {
      return $q.reject();
    }

    var deferred = $q.defer();
    // Check if a new cache is available on page load.
    $window.addEventListener('load', function(e) {

      if (update && appCache.status === appCache.IDLE) {
        console.log('Updating the app cache!');
        appCache.update();
      }

      appCache.addEventListener('updateready', function(e) {
        if (appCache.status === window.applicationCache.UPDATEREADY) {
          console.log('Got update!');
          deferred.resolve(true);
        } else {
          deferred.resolve(false);
        }
      }, false);

      appCache.addEventListener('noupdate', function(e) {
        deferred.resolve(false);
      }, false);

    }, false);

    return deferred.promise;
  }

});
