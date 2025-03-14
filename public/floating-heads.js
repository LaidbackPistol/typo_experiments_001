/**
 * SOLUTION AUTONOME POUR FAIRE TOURNER LES TÊTES FLOTTANTES
 * Ce script s'exécute indépendamment du code floating-heads.js original
 */

(function() {
    console.log("🎵 EN5EMBLE: Initialisation du script de rotation des têtes");
    
    // Configuration
    const config = {
      minInterval: 3000,   // Temps minimum entre les rotations (ms)
      maxInterval: 8000,   // Temps maximum entre les rotations (ms)
      spinDuration: 800,   // Durée de base pour une rotation (ms)
      maxRotations: 3      // Nombre maximum de rotations
    };
    
    // Variables d'état
    let isMusicPlaying = false;
    let spinInterval = null;
    let initialized = false;
    
    // Fonction principale d'initialisation
    function init() {
      if (initialized) return;
      
      // Ajouter les styles CSS pour la rotation
      addSpinStyles();
      
      // Configurer la détection de la musique Soundcloud
      setupSoundcloudDetection();
      
      // Exposer les fonctions de test
      window.spinHeads = {
        spin: spinRandomHead,
        toggleMusic: toggleMusic,
        status: getStatus
      };
      
      initialized = true;
      console.log("🎵 EN5EMBLE: Script de rotation initialisé");
    }
    
    // Obtenir l'état actuel
    function getStatus() {
      const heads = document.querySelectorAll('img[src*="5_heads"]');
      return {
        headsFound: heads.length,
        musicPlaying: isMusicPlaying,
        spinInterval: !!spinInterval
      };
    }
    
    // Ajouter les styles CSS pour l'animation de rotation
    function addSpinStyles() {
      if (document.getElementById('head-spin-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'head-spin-styles';
      style.textContent = `
        @keyframes en5embleSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Configurer la détection de la lecture Soundcloud
    function setupSoundcloudDetection() {
      console.log("🎵 EN5EMBLE: Configuration de la détection Soundcloud");
      
      // Écouter les messages de Soundcloud
      window.addEventListener('message', (event) => {
        // Ne traiter que les messages de Soundcloud
        if (!event.origin.includes('soundcloud.com')) return;
        
        try {
          // Vérifier les messages d'état du lecteur
          if (typeof event.data === 'object' && 
              event.data.soundcloud && 
              event.data.soundcloud.playerState) {
            
            const newState = event.data.soundcloud.playerState === 'playing';
            
            // Mettre à jour seulement si l'état a changé
            if (newState !== isMusicPlaying) {
              console.log(`🎵 EN5EMBLE: Musique ${newState ? 'démarrée' : 'arrêtée'}`);
              toggleMusic(newState);
            }
          }
        } catch (e) {
          // Ignorer les erreurs cross-origin
        }
      });
      
      // Activer l'API sur les iframes Soundcloud
      updateSoundcloudIframes();
      
      // Observer les nouveaux iframes
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length) {
            // Vérifier pour de nouveaux iframes
            const hasNewIframes = Array.from(mutation.addedNodes).some(node => {
              return node.tagName === 'IFRAME' && node.src && node.src.includes('soundcloud.com');
            });
            
            if (hasNewIframes) {
              updateSoundcloudIframes();
            }
          }
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    
    // Mettre à jour les iframes Soundcloud pour activer l'API
    function updateSoundcloudIframes() {
      const iframes = document.querySelectorAll('iframe[src*="soundcloud.com"]');
      let updated = 0;
      
      iframes.forEach(iframe => {
        if (!iframe.src.includes('api_widget=1') && !iframe.dataset.apiEnabled) {
          try {
            const newSrc = iframe.src + (iframe.src.includes('?') ? '&' : '?') + 'api_widget=1';
            iframe.src = newSrc;
            iframe.dataset.apiEnabled = 'true';
            updated++;
          } catch (e) {
            // Ignorer les erreurs
          }
        }
      });
      
      if (updated > 0) {
        console.log(`🎵 EN5EMBLE: API activée sur ${updated} iframes Soundcloud`);
      }
      
      return iframes.length;
    }
    
    // Activer/désactiver l'état de lecture de musique
    function toggleMusic(state) {
      isMusicPlaying = (state !== undefined) ? !!state : !isMusicPlaying;
      
      if (isMusicPlaying) {
        startRandomSpins();
      } else {
        stopRandomSpins();
      }
      
      return `Musique ${isMusicPlaying ? 'en lecture' : 'arrêtée'}`;
    }
    
    // Démarrer les rotations aléatoires
    function startRandomSpins() {
      if (spinInterval) return;
      
      console.log("🎵 EN5EMBLE: Démarrage des rotations aléatoires");
      
      // Faire une première rotation après un court délai
      setTimeout(spinRandomHead, 1000);
      
      // Planifier la prochaine rotation avec un intervalle aléatoire
      scheduleNextSpin();
    }
    
    // Planifier la prochaine rotation
    function scheduleNextSpin() {
      if (spinInterval) {
        clearTimeout(spinInterval);
      }
      
      const delay = Math.floor(
        Math.random() * (config.maxInterval - config.minInterval) + 
        config.minInterval
      );
      
      spinInterval = setTimeout(() => {
        if (isMusicPlaying) {
          spinRandomHead();
          scheduleNextSpin();
        }
      }, delay);
    }
    
    // Arrêter les rotations aléatoires
    function stopRandomSpins() {
      if (spinInterval) {
        clearTimeout(spinInterval);
        spinInterval = null;
        console.log("🎵 EN5EMBLE: Arrêt des rotations aléatoires");
      }
    }
    
    // Faire tourner une tête aléatoire
    function spinRandomHead() {
      // Chercher toutes les têtes à chaque fois pour s'assurer d'avoir les plus récentes
      const heads = document.querySelectorAll('img[src*="5_heads"]');
      
      if (heads.length === 0) {
        console.log("🎵 EN5EMBLE: Aucune tête trouvée pour la rotation");
        return false;
      }
      
      // Sélectionner une tête aléatoire
      const index = Math.floor(Math.random() * heads.length);
      const head = heads[index];
      
      // Ignorer si déjà en rotation
      if (head.dataset.spinning === 'true') {
        console.log("🎵 EN5EMBLE: Tête déjà en rotation, essai d'une autre");
        if (heads.length > 1) {
          return spinRandomHead();
        }
        return false;
      }
      
      // Marquer comme en rotation
      head.dataset.spinning = 'true';
      
      // Déterminer le nombre de rotations (1-3)
      const rotations = Math.floor(Math.random() * config.maxRotations) + 1;
      const duration = config.spinDuration * rotations;
      
      console.log(`🎵 EN5EMBLE: Rotation de la tête ${index} (${rotations} tours)`);
      
      // Sauvegarder les styles originaux
      const originalTransform = head.style.transform || '';
      
      // Appliquer la rotation
      // Utiliser animation si disponible pour une meilleure performance
      try {
        head.style.animation = `en5embleSpin ${duration}ms ease-in-out`;
      } catch (e) {
        // Fallback sur transform en cas d'erreur
        head.style.transition = `transform ${duration}ms ease-in-out`;
        
        // Forcer un reflow pour s'assurer que la transition s'applique
        head.offsetHeight;
        
        // Appliquer la rotation
        head.style.transform = `${originalTransform} rotate(${360 * rotations}deg)`;
      }
      
      // Réinitialiser après la fin de l'animation
      setTimeout(() => {
        head.style.animation = '';
        head.style.transition = '';
        head.style.transform = originalTransform;
        head.dataset.spinning = 'false';
        
        console.log(`🎵 EN5EMBLE: Rotation de la tête ${index} terminée`);
      }, duration + 50);
      
      return true;
    }
    
    // Initialiser lorsque le DOM est prêt
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();