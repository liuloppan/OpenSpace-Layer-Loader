import images from './images';

let screenspaceRenderables = [];

export default (openspace) => {

  async function sleep(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  function fullImageUri(identifier) {
    return "screenspace-image-" + identifier;
  }

  function getClose() {
    openspace.setPropertyValue("NavigationHandler.OrbitalNavigator.StereoscopicDepthOfFocusSurface", 1.5, 1);
  }

  function stepAway() {
    openspace.setPropertyValue("NavigationHandler.OrbitalNavigator.StereoscopicDepthOfFocusSurface", 8, 1);
  }

  async function addImage(identifier) {
    const imageData = images[identifier];

    if (!imageData) {
      console.error("Missing image data for " + identifier);
      return;
    }

    const url = imageData.url;
    const uri = fullImageUri(identifier);
    const position = imageData.position || [3, 0, 0];
    const tweenPosition = imageData.tweenPosition;

    const initialPosition = tweenPosition ? [position[0] + 10, position[1], position[2]] : position;

    const spec = {
        Type: "ScreenSpaceImageOnline",
        Identifier: uri,
        Name: identifier,
        URL: url,
        Enabled: true,
        UseRadiusAzimuthElevation: true,
        FaceCamera: true,
        RadiusAzimuthElevation: initialPosition,
        UsePerspectiveProjection: true,
        Alpha: 0,
        Scale: imageData.scale || 1
    };

    // If image is already added, this will throw an error, but that's fine for the moment.
    openspace.addScreenSpaceRenderable(spec);
    screenspaceRenderables.push(uri);

    // Enable the image if it already existed but was invisible.
    openspace.setPropertyValue("ScreenSpace." + uri + ".Alpha", 0);
    openspace.setPropertyValue("ScreenSpace." + uri + ".Enabled", true);  
    openspace.setPropertyValue("ScreenSpace." + uri + ".RadiusAzimuthElevation", initialPosition);
    openspace.setPropertyValue("ScreenSpace." + uri + ".Rotation", imageData.rotation || [0, 0, 0]);


    await sleep(500);
    openspace.setPropertyValueSingle("ScreenSpace." + uri + ".RadiusAzimuthElevation", position, 1, 'CubicEaseOut');
    openspace.setPropertyValue("ScreenSpace." + uri + ".Alpha", 1, 1);
  }


  async function removeImage(identifier) {
    const uri = fullImageUri(identifier);
    openspace.setPropertyValue("ScreenSpace." + uri + ".Alpha", 0, 1);
    await sleep(2000);
    openspace.setPropertyValue("ScreenSpace." + uri + ".Enabled", false);
    // Ideally, we want to:
    // openspace.removeScreenSpaceRenderable(uri);
    // However, there is an issue with interpolations and removing property owners.

  }

  function clearImages() {
    screenspaceRenderables.forEach(ssr => {
      openspace.removeScreenSpaceRenderable(ssr);
    })
    screenspaceRenderables = [];
  }


  async function showInsignias() {
    const tween = 0.5;
    const gap = 1 * 1000;
    
    openspace.setPropertyValue("Scene.Apollo" + 11 + "Insignia.Renderable.Opacity", 1, tween)
    await sleep(gap);
    openspace.setPropertyValue("Scene.Apollo" + 12 + "Insignia.Renderable.Opacity", 1, tween)
    await sleep(gap);
    openspace.setPropertyValue("Scene.Apollo" + 14 + "Insignia.Renderable.Opacity", 1, tween)
    await sleep(gap);
    openspace.setPropertyValue("Scene.Apollo" + 15 + "Insignia.Renderable.Opacity", 1, tween)
    await sleep(gap);
    openspace.setPropertyValue("Scene.Apollo" + 16 + "Insignia.Renderable.Opacity", 1, tween)
    await sleep(gap);
    openspace.setPropertyValue("Scene.Apollo" + 17 + "Insignia.Renderable.Opacity", 1, tween)
  }

  function hideInsignias() {
    const tween = 0.5;
    openspace.setPropertyValue("Scene.Apollo*Insignia.Renderable.Opacity", 0, tween)
  }

  function jumpToPreEarthrise() {
    // Atmosphere needs to be disabled, due to a bug with stereo separation.
    openspace.setPropertyValue('Scene.EarthAtmosphere.Renderable.Enabled', false)
    openspace.time.setDeltaTime(1);
    openspace.time.setPause(true);
    openspace.time.setTime("1968 DEC 24 16:37:31");
    openspace.navigation.setCameraState({
      Anchor: "Apollo8Pivot",
      Aim: "",
      ReferenceFrame: "Apollo8Pivot",
      Position: [-7.174805E0, -1.820108E1, -3.634688E1],
      Rotation: [0.697424E0, -0.694746E0, 0.539866E-1, 0.167373E0],
    });
  }

  function jumpInsideApollo8() {
    openspace.time.setPause(true);
    openspace.time.setTime("1968 DEC 24 16:38:43");
    openspace.setPropertyValue("NavigationHandler.OrbitalNavigator.UseAdaptiveStereoscopicDepth", false);
    openspace.setPropertyValue("NavigationHandler.OrbitalNavigator.StaticViewScaleExponent", 1);
    openspace.navigation.setCameraState({
      Anchor: "Apollo8Pivot",
      ReferenceFrame: "Apollo8Pivot",
      Aim: "",
      Position: [-0.250397E0,-0.606144E0,-1.124966E0],
      Rotation: [-0.429855E0,0.584589E0,-0.498124E0,-0.474713E0]
    });
  }

  function jumpOutOfApollo8() {
    openspace.time.setPause(true);
    openspace.time.setTime("1968 DEC 24 16:39:43");
    openspace.setPropertyValue("NavigationHandler.OrbitalNavigator.UseAdaptiveStereoscopicDepth", true);
    openspace.navigation.setCameraState({
      Aim:"",
      Anchor:"Apollo8Pivot",
      Position:[-1.279184E1,-1.339158E1,1.110525E1],
      ReferenceFrame:"Apollo8Pivot",
      Rotation:[0.145135E0,-0.215160E0,0.668888E0,0.696585E0]
    });
  }

  function useAdaptiveStereoscopicDepth() {
    openspace.setPropertyValue("NavigationHandler.OrbitalNavigator.UseAdaptiveStereoscopicDepth", true);
  }

  function enableAtmosphere() {
    openspace.setPropertyValue('Scene.EarthAtmosphere.Renderable.Enabled', true)
  }

  function enableAtmospheres(enabled) {
    openspace.setPropertyValue('Scene.*Atmosphere.Renderable.Enabled', enabled)
  }

  function showTrails(objects) {
    objects.map(async (object) => {
      let isEnabled = false;
      const returnValue = await openspace.getPropertyValue("Scene." + object + "Trail.Renderable.Enabled");
      if (returnValue) {
        isEnabled = returnValue[1];
      }
  
      if (!isEnabled) {      
        openspace.setPropertyValue("Scene." + object + "Trail.Renderable.Opacity", 0)
        openspace.setPropertyValue("Scene." + object + "Trail.Renderable.Enabled", true)
      }
      openspace.setPropertyValue("Scene." + object + "Trail.Renderable.Opacity", 1, 1)
    })
  }

  async function hideAllTrails() {
    const duration = 1;
    openspace.setPropertyValue("Scene.*Trail.Renderable.Opacity", 0, 1)
    setTimeout(() => {
      openspace.setPropertyValue("Scene.*Trail.Renderable.Enabled", false)  
    }, duration * 1000)
  }

  function playRealtime() {
    openspace.time.setDeltaTime(1);
    openspace.time.setPause(false);
  }

  async function fadeLayer(layer, enable) {
    if (enable) {
      openspace.setPropertyValueSingle(layer + ".Enabled", true);
    }
    openspace.setPropertyValueSingle(layer + ".Settings.Opacity", enable ? 1 : 0, 1);
    await sleep(1000);

    if (!enable) {
      openspace.setPropertyValueSingle(layer + ".Settings.Enabled", false);
    }
  }

  function enableApollo11Layers(enabled) {
    fadeLayer('Scene.Moon.Renderable.Layers.ColorLayers.LRO_NAC_Apollo_11', enabled)
    openspace.setPropertyValueSingle("Scene.Moon.Renderable.Layers.HeightLayers.LRO_NAC_Apollo_11.Enabled", enabled);
  }


  function enableApollo17Lro(enabled) {
    fadeLayer('Scene.Moon.Renderable.Layers.ColorLayers.LRO NAC Apollo 17', enabled)
    openspace.setPropertyValueSingle("Scene.Moon.Renderable.Layers.HeightLayers.LRO NAC Apollo 17.Enabled", enabled);
  }

  function enableApollo17Travmap(enabled) {
    if (enabled) {
      openspace.setPropertyValueSingle("Scene.Moon.Renderable.Layers.ColorLayers.A17_travmap.BlendMode", 0.0);
    }
    fadeLayer('Scene.Moon.Renderable.Layers.ColorLayers.A17_travmap', enabled)
  }

  async function enableNavigationSats(enable) {
    //openspace.setPropertyValue("Scene.beidou_*.Renderable.Enabled", enable);
    //openspace.setPropertyValue("Scene.galileo_*.Renderable.Enabled", enable);
    //openspace.setPropertyValue("Scene.glo-*.Renderable.Enabled", enable);
      
    if (!enable) {
      openspace.setPropertyValue("Scene.gps-*.Renderable.Opacity", 1);
      openspace.setPropertyValue("Scene.gps-*.Renderable.Opacity", 0, 1);
      await sleep(1000);
    }

    openspace.setPropertyValue("Scene.gps-*.Renderable.Enabled", enable);

    if (enable) {
      openspace.setPropertyValue("Scene.gps-*.Renderable.Opacity", 1, 1);
    }

    
    //openspace.setPropertyValue("Scene.musson_*.Renderable.Enabled", enable);
    //openspace.setPropertyValue("Scene.nnss_*.Renderable.Enabled", enable);
    //openspace.setPropertyValue("Scene.sbas_*.Renderable.Enabled", enable);
  }

  return [
    {
      title: "Setup",
      buttons: {
        'Load Apollo 8': () => { openspace.asset.add("scene/solarsystem/missions/apollo/apollo8") },
        'Full Moon': async () => { hideAllTrails(); await sleep(1500); openspace.time.setTime("2018-09-24 13:00:00") },
        'Hide All Trails': () => { hideAllTrails(); },
      }
    },
    {
      title: "Trails",
      buttons: {
        'Moon': () => { showTrails(['Moon']) },
        'Apollo 8 Launch': () => { showTrails(['Apollo8Launch']) },
        'Apollo 8 Moon': () => { showTrails(['Apollo8Moon']) },
        'Apollo 8 Full': () => { showTrails(['Apollo8EarthBarycenter']) },
        'Earth, Moon & Mars': () => { showTrails(['Earth', 'Moon', 'Mars']) },
        'Hide All': () => { hideAllTrails(); },
      }
    },
    {
      title: "Sputnik Intro",
      buttons: {
        Show: () => { addImage('sputnik'); },
        Hide: () => { removeImage('sputnik'); }
      }
    },
    {
      title: "Flying",
      description: "Skip this on a normal show.",
      buttons: {
        'Man in the Moon': () => { addImage('manInTheMoone'); },
        'Jules Verne': async () => { addImage('julesVerne1'); await sleep(1000); addImage('julesVerne2'); },
        'Goddard': () => { addImage('goddard'); },
        'Hide': () => {
          removeImage('manInTheMoone');
          removeImage('julesVerne1');
          removeImage('julesVerne2');
          removeImage('goddard');
        }
      }
    },
    {
      title: "Soviet 1",
      buttons: {
        'Laika': () => { addImage('laika'); },
        'Luna 2': () => { addImage('luna2'); },
        'Luna 3': () => { addImage('luna3'); /* stamps */ },
        'Hide': () => {
          removeImage('laika');
          removeImage('luna2');
          removeImage('luna3');
        }
      }
    },
    {
      title: "Soviet 2",
      buttons: {
        'Gagarin': () => { addImage('gagarin'); },
        'Vostok': () => { addImage('vostokSpacecraft'); },
        'News': () => { addImage('sovietNews'); /* stamps */ },
        'Teresjkova': () => { addImage('teresjkovaMedals'); addImage('teresjkovaMedals');/* stamps */ },
        'Hide': () => {
          removeImage('gagarin');
          removeImage('vostokSpacecraft');
          removeImage('sovietNews');
          removeImage('teresjkovaMedals');
        }
      }
    },
    {
      title: "USA 1",
      buttons: {
        'Explorer': () => { addImage('explorer'); },
        'Shephard': () => { addImage('shepard'); /*addImage('mercury3');*/ },
        'Glenn': () => { addImage('glenn'); /*addImage('mercury6');*/ },
        'Hide': () => {
          removeImage('explorer');
          removeImage('shepard');
          removeImage('glenn');
          //removeImage('mercury3');
          //removeImage('mercury6');
        }
      }
    },
    {
      title: "Kennedy",
      description: "Move moon to side! \n Insert projector: Kennedy Speech.",
      buttons: {
        'Insert Projector On': () => { addImage('insertProjector'); },
        'Insert Projector Off': () => { removeImage('insertProjector'); }
      }// TODO if time: provide subtitles
    },
    {
      title: "Trip to the Moon",
      description: "Insert projector: Trip To The Moon."
    },
    {
      title: "Apollo 8 Intro",
      buttons: {
        'Launch time': async () => { hideAllTrails(); await sleep(3000); openspace.time.setTime("1968-12-21T12:51:51.0"); showTrails(['Apollo8Launch']) },
        'Show Insignia': () => { addImage('apollo8Insignia'); },
        'Hide Insignia': () => { removeImage('apollo8Insignia'); },
      }
    },
    {
      title: "Apollo 8",
      description: "1 minute/s. Leave Earth.",
    },
    {
      title: "Earthrise",
      description: "Start audio from Earthrise at the same time as starting the Earthrise. \n Move Earth to left before showing real photo.",

      buttons: {
        'Jump to Pre-Earthrise': () => { jumpToPreEarthrise() },
        'Start Earthrise': () => { playRealtime() },
        'Interior': () => { jumpInsideApollo8() },
        'Exterior': () => { jumpOutOfApollo8() },
        'Enable Atmosphere': () => { enableAtmosphere() },
        'Show photo': () => { addImage('earthrise'); },
        'Hide photo': () => { removeImage('earthrise'); },
        'Enable Adaptive Stero': () => { useAdaptiveStereoscopicDepth() },
      }
    },
    {
      title: "Apollo 11 Launch",
      description: "Insert projector: Saturn V."
    },
    {
      title: "Apollo 11 Site",
      description: "Land at Apollo 11 site. Use arrow keys for flip book. Show lander.",
      /* TODO */
      buttons: {
        'Show Insignia': () => { addImage('apollo11Insignia'); },
        'Hide Insignia': () => { removeImage('apollo11Insignia'); },
        'Layers On': () => { enableApollo11Layers(true); },
        'Layers Off': () => { enableApollo11Layers(false); },

        'News': async () => { addImage('apollo11News1'); await sleep(1000); addImage('apollo11News2'); },
        'Armstrong': () => { addImage('armstrongLadder'); },
        'Aldrin': () => { addImage('aldrinLadder'); },
        'Footprints': () => { addImage('apollo11Footprints'); },
        'More Footprints': () => { addImage('apollo11MoreFootprints'); },
        'Nixon': () => { addImage('nixon'); },
        'Hide moon images': () => {
          removeImage('armstrongLadder');
          removeImage('aldrinLadder');
          removeImage('apollo11Footprints');
          removeImage('apollo11MoreFootprints');
          removeImage('nixon');
          removeImage('apollo11News1');
          removeImage('apollo11News2');
        },
      }
    },
    {
      title: "Apollo 11 Landing",
      buttons: {
        //'Problem': () => { addImage('apollo13Problem'); },
        'Landing': async () => {
          addImage('apollo13Landing');
          await sleep(500);
          addImage('apollo13InWater');
          await sleep(500);
          addImage('apollo13Helicopter');
          await sleep(500);
          addImage('apollo13LoadOnDeck');
         },
        //'Happy': async () => { removeImage('apollo13Problem'); await sleep(500); addImage('apollo13Happy'); },
        'Hide': () => {
          //removeImage('apollo13Problem');
          //removeImage('apollo13Happy');
          removeImage('apollo13Landing');
          removeImage('apollo13InWater');
          removeImage('apollo13Helicopter')
          removeImage('apollo13LoadOnDeck');
        },
      }
    },
    {
      title: "Apollo Landing sites",
      buttons: {
        'Show Insignias': () => { showInsignias() },
        'Hide Insignias': () => { hideInsignias() },
      }
    },
    {
      title: "Apollo 17",
      description: "Land at Apollo 17 site.",
      /* TODO */
      buttons: {
        'LRO On': () => { enableApollo17Lro(true); },
        'LRO Off': () => { enableApollo17Lro(false); },
        'Travmap On': () => { enableApollo17Travmap(true); },
        'Travmap Off': () => { enableApollo17Travmap(false); } 
      }
    },
    {
      title: "Apollo 17 Pictures",
      buttons: {
        'LRV': async () => {
          addImage('apollo17Lrv');
         },
         'Digging': async () => {
          addImage('apollo17Digging');
         },
         'Reflector': async () => {
          addImage('apollo17Reflector');
         },
         'Boulder': async () => {
          addImage('apollo17Boulder');
         },
        'Hide': () => {
          removeImage('apollo17Lrv');
          removeImage('apollo17Digging');
          removeImage('apollo17Reflector');
          removeImage('apollo17Boulder');
        },
      }
    },
    {
      title: "Mars",
      description: "Land at Ganges Chasma (8.43 S, 46.69 W) .",
    },
    {
      title: "Satellites",
      buttons: {
        'Load navigation sats': () => { openspace.asset.add("scene/solarsystem/planets/earth/satellites/navigation/gps"); },
        'Show navigation sats': () => { enableNavigationSats(true); },
        'Hide navigation sats': () => { enableNavigationSats(false); }
      }
    },
    {
      title: "Utilities",
      buttons: {
        'Clear all images (fragile)': () => { clearImages() },
        'Disable atmospheres': () => { enableAtmospheres(false) },
        'Enable atmospheres': () => { enableAtmospheres(true) },
        'Get Close': () => { getClose(); },
        'Step Away': () => { stepAway(); }
      }
    }
  ];
} 