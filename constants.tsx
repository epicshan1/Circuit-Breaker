
import { Protocol } from './types';

export const PROTOCOLS: Protocol[] = [
  {
    id: 'panic',
    title: 'Panic / Anxiety',
    icon: '🔥',
    description: 'Heart racing • Overwhelmed • Spiraling',
    fullTitle: 'Sympathetic Shutdown Protocol',
    duration: 90,
    explanation: 'Your nervous system is in fight-or-flight overdrive. This protocol uses physiological sighs and cold stimulation to activate your vagus nerve and force a parasympathetic response.',
    hasBreathing: true,
    steps: [
      { title: 'Physiological Sigh (20s)', content: 'Double inhale through nose, long exhale through mouth. Inhale deeply, then inhale again to top it off, then slow exhale. Repeat 3 times.', duration: 20 },
      { title: 'Cold Splash (30s)', content: 'If possible, splash cold water on your face or hold ice to your forehead. This triggers the dive reflex.', duration: 30 },
      { title: 'Bilateral Stimulation (40s)', content: 'Butterfly hug: Cross arms over chest, alternate tapping shoulders. Left, right, left, right.', duration: 40 }
    ],
    audioGuide: [
      { time: 0, text: "Find a comfortable position. You're safe here. Let's bring your nervous system back to balance." },
      { time: 10, text: 'Take a deep breath in through your nose. And another quick inhale to top it off.' },
      { time: 20, text: 'Now release slowly through your mouth. Feel your shoulders drop.' },
      { time: 30, text: 'If you have cold water or ice, gently apply it to your face. Feel the coolness.' },
      { time: 50, text: 'Now cross your arms over your chest. Tap your left shoulder, then your right. Gentle rhythm.' },
      { time: 80, text: "Notice how different you feel. This is you taking your power back." }
    ]
  },
  {
    id: 'freeze',
    title: 'Numb / Freeze',
    icon: '❄️',
    description: "Can't focus • Heavy • Disconnected",
    fullTitle: 'Activation Protocol',
    duration: 90,
    explanation: 'Your nervous system is in shutdown. This protocol uses movement and sensory stimulation to bring energy back online.',
    hasBreathing: false,
    steps: [
      { title: 'Shake It Out (30s)', content: 'Stand up. Shake your hands vigorously. Then shake your whole body - arms, legs, shoulders.', duration: 30 },
      { title: 'Strong Sensation (30s)', content: 'Ice, sour candy, or stomp your feet hard. You need intense sensory input to override numbness.', duration: 30 },
      { title: 'Name 5 Things (30s)', content: 'Look around: 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.', duration: 30 }
    ],
    audioGuide: [
      { time: 0, text: "You're safe. Let's wake your system back up, gently. Stand if you can." },
      { time: 10, text: 'Shake your hands. Vigorous, like shaking off water. Feel the movement.' },
      { time: 35, text: 'Now you need strong sensation. Ice, sour candy, stomp your feet. Do it now.' },
      { time: 65, text: 'Look around. Name 5 things you see. Out loud if you can.' },
      { time: 85, text: "You're back. Welcome back." }
    ]
  },
  {
    id: 'insomnia',
    title: 'Insomnia',
    icon: '🌙',
    description: "Mind won't stop • Can't sleep",
    fullTitle: 'Sleep Onset Protocol',
    duration: 90,
    explanation: 'Your nervous system is too activated for sleep. This uses 4-7-8 breathing and progressive relaxation.',
    hasBreathing: true,
    steps: [
      { title: '4-7-8 Breathing (45s)', content: 'Inhale 4 counts, hold 7, exhale 8. This creates drowsiness. Repeat 3 times.', duration: 45 },
      { title: 'Body Scan (45s)', content: 'Starting at toes, relax each body part. Toes, feet, calves, thighs, stomach, chest, arms, shoulders, jaw, eyes.', duration: 45 }
    ],
    audioGuide: [
      { time: 0, text: "Your mind is busy, but your body is ready to rest. Let's signal sleep is safe." },
      { time: 10, text: 'Breathe in gently through your nose for 4.' },
      { time: 20, text: 'Hold for 7. Feel the pressure building slightly.' },
      { time: 35, text: 'Exhale slowly through your mouth for 8. Let everything go.' },
      { time: 50, text: 'Now focus on your toes. Let them go limp. Heavy. Sinking.' },
      { time: 80, text: "Your whole body is heavy. Sinking. Safe. Ready for sleep." }
    ]
  }
];
