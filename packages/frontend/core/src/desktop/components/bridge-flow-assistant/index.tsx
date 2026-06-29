import { BRAND_AI_NAME } from '@bridgeflow/component/brand';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import bwsIconUrl from './bws-icon.webp';
import * as styles from './styles.css';

type AssistantRole = 'assistant' | 'user';

type AssistantMessage = {
  id: string;
  role: AssistantRole;
  text: string;
};

type GeminiPart = {
  text?: string;
};

type GeminiCandidate = {
  content?: {
    parts?: GeminiPart[];
  };
};

type GeminiResponse = {
  candidates?: GeminiCandidate[];
  error?: {
    message?: string;
  };
};

type SpeechRecognitionInstance = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechRecognitionResultLike = {
  transcript: string;
};

type SpeechRecognitionResultEventLike = {
  resultIndex: number;
  results: ArrayLike<
    ArrayLike<SpeechRecognitionResultLike> & { isFinal?: boolean }
  >;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const _QUICK_PROMPTS = [
  'How do I start my first note in BRIDGE Flow?',
  'How should I use folders, tags, and collections together?',
  'What is the fastest way to find docs and organize my workspace?',
  'Give me a simple onboarding checklist for this app.',
];

const FEATURE_CARDS = [
  {
    title: 'Getting Started',
    prompt:
      'Walk me through how to get started in BRIDGE Flow as a new user.',
  },
  {
    title: 'Organize Better',
    prompt:
      'Explain the best way to organize my docs with folders, tags, favorites, and collections.',
  },
];

function createMessage(role: AssistantRole, text: string): AssistantMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
  };
}

function createSystemPrompt() {
  return [
    `You are ${BRAND_AI_NAME}, the in-product assistant for BRIDGE Flow.`,
    'Your job is to help users understand what to do in the app, how to use it, and how to organize their work.',
    'Reply with concise, practical instructions in a supportive product-guide tone.',
    'Prefer simple step-by-step guidance over abstract explanations.',
    'Focus on BRIDGE Flow features such as docs, collections, tags, folders, favorites, search, settings, and general workspace organization.',
    'If the user asks about something the app may not support, say so plainly and offer the closest workflow inside the app.',
    'Do not claim to have performed actions in the workspace.',
    'Keep most answers under 180 words unless the user asks for more detail.',
  ].join('\n');
}

async function sendGeminiMessage(
  apiKey: string,
  messages: AssistantMessage[]
): Promise<string> {
  const endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  const contents = messages.map(message => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.text }],
  }));

  const response = await fetch(
    `${endpoint}?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: createSystemPrompt() }],
        },
        contents,
        generationConfig: {
          temperature: 0.6,
          topP: 0.9,
          maxOutputTokens: 700,
        },
      }),
    }
  );

  const payload = (await response.json()) as GeminiResponse;

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        'Gemini request failed. Check the API key and try again.'
    );
  }

  const text = payload.candidates?.[0]?.content?.parts
    ?.map(part => part.text ?? '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('Gemini returned an empty response.');
  }

  return text;
}

function splitMessage(text: string) {
  return text
    .split(/\n{2,}/)
    .map(part => part.trim())
    .filter(Boolean);
}

const DEFAULT_INTRO =
  'How can I help you today? I can guide you through notes, folders, tags, collections, search, and workspace setup.';

function useSpeechRecognition() {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const supported =
    typeof window !== 'undefined'
      ? Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
      : false;

  const getRecognition = useCallback(() => {
    if (!supported) {
      return null;
    }

    if (!recognitionRef.current) {
      const Recognition =
        window.SpeechRecognition ?? window.webkitSpeechRecognition;

      if (!Recognition) {
        return null;
      }

      const recognition = new Recognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;
    }

    return recognitionRef.current;
  }, [supported]);

  return useMemo(
    () => ({
      supported,
      getRecognition,
    }),
    [supported, getRecognition]
  );
}

const ChatIcon = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 4.25C7.72 4.25 4.25 7.36 4.25 11.2C4.25 13.11 5.09 14.84 6.48 16.08C6.64 16.22 6.72 16.43 6.69 16.64L6.31 19.2L9.02 17.89C9.18 17.81 9.38 17.8 9.55 17.85C10.33 18.07 11.15 18.18 12 18.18C16.28 18.18 19.75 15.07 19.75 11.23C19.75 7.39 16.28 4.25 12 4.25Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M6 6L18 18M18 6L6 18"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const MicIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 15.5C14.21 15.5 16 13.71 16 11.5V7.5C16 5.29 14.21 3.5 12 3.5C9.79 3.5 8 5.29 8 7.5V11.5C8 13.71 9.79 15.5 12 15.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M5.5 11.5C5.5 15.09 8.41 18 12 18C15.59 18 18.5 15.09 18.5 11.5M12 18V21"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const SpeakerIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 9.75V14.25H8.5L13 18V6L8.5 9.75H5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M16.5 9.5C17.43 10.26 18 11.39 18 12.63C18 13.87 17.43 15 16.5 15.75"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const SendIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4 11.5L19.5 4L14 20L11 13L4 11.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

export const BridgeFlowAssistant = () => {
  const apiKey = BUILD_CONFIG.GEMINI_API_KEY;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inputRef = useRef('');
  const { supported, getRecognition } = useSpeechRecognition();

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading]);

  useEffect(() => {
    if (!open) {
      return;
    }
    textareaRef.current?.focus();
  }, [open]);

  // Allow other parts of the app (e.g. the dashboard AI recommendations) to
  // open the assistant and optionally prefill a prompt.
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ prompt?: string }>).detail;
      setOpen(true);
      if (detail?.prompt) {
        setInput(detail.prompt);
      }
    };
    window.addEventListener('bridge:open-assistant', handler);
    return () => window.removeEventListener('bridge:open-assistant', handler);
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      getRecognition()?.stop();
    };
  }, [getRecognition]);

  const pushAssistantMessage = (text: string) => {
    setMessages(current => [...current, createMessage('assistant', text)]);
  };

  const speak = (text: string) => {
    if (!voiceReplies || !('speechSynthesis' in window)) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const submit = async (value: string) => {
    const text = value.trim();
    if (!text || loading) {
      return;
    }

    const nextMessages = [...messages, createMessage('user', text)];
    setMessages(nextMessages);
    setInput('');
    inputRef.current = '';
    setTranscript('');
    setLoading(true);

    if (!apiKey) {
      setLoading(false);
      pushAssistantMessage(
        'Gemini is not configured yet. Set the GEMINI_API_KEY environment variable before starting BRIDGE Flow, then reload the app.'
      );
      return;
    }

    try {
      const reply = await sendGeminiMessage(apiKey, nextMessages);
      setMessages(current => [...current, createMessage('assistant', reply)]);
      speak(reply);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong while contacting Gemini.';
      pushAssistantMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const onToggleListening = () => {
    const recognition = getRecognition();

    if (!recognition) {
      pushAssistantMessage(
        'Voice input is not available in this browser. Try Chrome or Edge for microphone transcription.'
      );
      return;
    }

    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }

    recognition.onresult = event => {
      const collected = Array.from(event.results)
        .slice(event.resultIndex)
        .map(result => result[0]?.transcript ?? '')
        .join(' ')
        .trim();

      setTranscript(collected);
      setInput(collected);
      inputRef.current = collected;
    };

    recognition.onerror = event => {
      setListening(false);
      pushAssistantMessage(
        event.error === 'not-allowed'
          ? 'Microphone permission was blocked. Allow mic access in the browser and try again.'
          : 'Voice input failed. Please try again or type your message.'
      );
    };

    recognition.onend = () => {
      setListening(false);
      const finalTranscript = inputRef.current.trim();
      if (finalTranscript) {
        submit(finalTranscript).catch(console.error);
      }
    };

    setTranscript('');
    setListening(true);
    recognition.start();
  };

  const onAskPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current = prompt;
    submit(prompt).catch(console.error);
  };

  return (
    <div className={styles.shell}>
      {open ? (
        <section
          aria-label={`${BRAND_AI_NAME} assistant`}
          className={styles.panel}
        >
          <header className={styles.panelHeader}>
            <div className={styles.titleGroup}>
              <img
                src={bwsIconUrl}
                alt="BWS"
                className={styles.headerAvatarImage}
              />
              <div className={styles.headerText}>
                <div className={styles.title}>BRIDGE Flow AI</div>
                <div className={styles.subtitle}>
                  Workspace help and guidance
                </div>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.iconButton}
                onClick={() => setVoiceReplies(value => !value)}
                title={
                  voiceReplies
                    ? 'Turn off spoken replies'
                    : 'Turn on spoken replies'
                }
                type="button"
              >
                <SpeakerIcon />
              </button>
              <button
                className={styles.iconButton}
                onClick={() => {
                  setOpen(false);
                  setListening(false);
                  getRecognition()?.stop();
                }}
                title="Close assistant"
                type="button"
              >
                <CloseIcon />
              </button>
            </div>
          </header>

          <div className={styles.content}>
            <div className={styles.messages} ref={scrollerRef}>
              <div className={styles.assistantRow}>
                <img
                  src={bwsIconUrl}
                  alt="BWS"
                  className={styles.avatarImage}
                />
                <div className={styles.assistantColumn}>
                  <div className={styles.assistantBubble}>
                    <div className={styles.bubbleMeta}>BRIDGE Flow AI</div>
                    <div className={styles.bubbleText}>
                      <p>{DEFAULT_INTRO}</p>
                    </div>
                  </div>
                  <div className={styles.quickActions}>
                    {FEATURE_CARDS.map(card => (
                      <button
                        className={styles.quickAction}
                        key={card.title}
                        onClick={() => onAskPrompt(card.prompt)}
                        type="button"
                      >
                        {card.title}
                      </button>
                    ))}
                    <button
                      className={styles.quickAction}
                      onClick={onToggleListening}
                      type="button"
                    >
                      <span>Try Voice Mode</span>
                      <div aria-hidden="true" className={styles.voiceBars}>
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                    </button>
                  </div>
                  {!apiKey ? (
                    <div className={styles.keyNotice}>
                      Gemini key missing. Set <strong>GEMINI_API_KEY</strong>{' '}
                      before starting the app, then refresh.
                    </div>
                  ) : null}
                </div>
              </div>

              {messages.map(message =>
                message.role === 'assistant' ? (
                  <div className={styles.assistantRow} key={message.id}>
                    <img
                      src={bwsIconUrl}
                      alt="BWS"
                      className={styles.avatarImage}
                    />
                    <div className={styles.assistantColumn}>
                      <div className={styles.assistantBubble}>
                        <div className={styles.bubbleMeta}>
                          BRIDGE Flow AI
                        </div>
                        <div className={styles.bubbleText}>
                          {splitMessage(message.text).map((part, index) => (
                            <p key={`${message.id}-${index}`}>{part}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.userRow} key={message.id}>
                    <div className={styles.userBubble}>
                      <div className={styles.bubbleText}>
                        {splitMessage(message.text).map((part, index) => (
                          <p key={`${message.id}-${index}`}>{part}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              )}
              {loading ? (
                <div className={styles.assistantRow}>
                  <img
                    src={bwsIconUrl}
                    alt="BWS"
                    className={styles.avatarImage}
                  />
                  <div className={styles.assistantColumn}>
                    <div className={styles.assistantBubble}>
                      <div className={styles.bubbleMeta}>
                        BRIDGE Flow AI
                      </div>
                      <div className={styles.bubbleText}>
                        <p>Thinking about the best next step for you...</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {transcript ? (
              <div className={styles.transcript}>Listening: {transcript}</div>
            ) : null}

            <div className={styles.composer}>
              <div className={styles.composerShell}>
                <label
                  className={styles.srOnly}
                  htmlFor="bridge-workspace-ai-input"
                >
                  Ask BRIDGE Flow AI
                </label>
                <textarea
                  className={styles.textarea}
                  id="bridge-workspace-ai-input"
                  onChange={event => setInput(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      submit(input).catch(console.error);
                    }
                  }}
                  placeholder="Type your question..."
                  ref={textareaRef}
                  value={input}
                />
                <div className={styles.composerActions}>
                  <div className={styles.footerLeft}>
                    <button
                      className={clsx(
                        styles.pillButton,
                        listening && styles.pillButtonActive
                      )}
                      onClick={onToggleListening}
                      type="button"
                    >
                      <MicIcon />
                      <span>{listening ? 'Listening' : 'Voice'}</span>
                    </button>
                    <button
                      className={clsx(
                        styles.pillButton,
                        voiceReplies && styles.pillButtonActive
                      )}
                      onClick={() => setVoiceReplies(value => !value)}
                      type="button"
                    >
                      <SpeakerIcon />
                      <span>{voiceReplies ? 'Speak On' : 'Speak'}</span>
                    </button>
                  </div>
                  <div className={styles.footerRight}>
                    <button
                      className={styles.sendButton}
                      disabled={loading || !input.trim()}
                      onClick={() => {
                        submit(input).catch(console.error);
                      }}
                      type="button"
                    >
                      <SendIcon />
                    </button>
                  </div>
                </div>
                {!supported ? (
                  <div className={styles.composerHint}>
                    Mic input needs Chrome or Edge.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <button
        className={clsx(styles.launcher, open && styles.launcherHidden)}
        onClick={() => setOpen(true)}
        title="Open BRIDGE Flow AI"
        type="button"
      >
        <ChatIcon />
      </button>
    </div>
  );
};
