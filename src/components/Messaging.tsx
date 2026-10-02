import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Bell, X } from 'lucide-react';
import { Messaging as ChatClient } from '../../shared/messaging';

export function Messaging() {
  const [chat] = useState(() => new ChatClient());
  const state = useSyncExternalStore(chat.subscribe, chat.snapshot);
  const dock = useRef<HTMLElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    void chat.start();
    return () => chat.stop();
  }, [chat]);
  useEffect(() => {
    if (state.open) dock.current?.focus();
  }, [state.open]);
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [state.messages.at(-1)?._id]);
  const close = () => {
    chat.close();
    launcher.current?.focus();
  };
  const submit = (task: () => Promise<void>) => (event: React.FormEvent) => {
    event.preventDefault();
    void task();
  };
  const current = state.conversations.find((item) => item._id === state.selected);
  return (
    <>
      <button
        ref={launcher}
        className="chat-launch"
        onClick={() => chat.open()}
        aria-expanded={state.open}
        aria-controls="messaging-dock"
      >
        {state.role === 'owner' ? <Bell size={18} /> : <MessageCircle size={18} />}
        {state.role === 'owner' ? 'Message inbox' : 'Message me'}
        {chat.unread > 0 && <span className="chat-badge">{chat.unread}</span>}
      </button>
      {state.open &&
        createPortal(
          <aside
            id="messaging-dock"
            className="chat-dock"
            role="dialog"
            aria-label="Portfolio messages"
            tabIndex={-1}
            ref={dock}
            onKeyDown={(event) => {
              if (event.key === 'Escape') close();
            }}
          >
            <header className="chat-header">
              <div>
                <strong>{state.role === 'owner' ? 'Your inbox' : 'Let’s talk'}</strong>
                <small>
                  {state.role
                    ? state.connected
                      ? 'Connected · private conversation'
                      : 'Reconnecting…'
                    : 'A direct conversation with Cliff'}
                </small>
              </div>
              <button aria-label="Close messages" onClick={close}>
                <X size={20} />
              </button>
            </header>
            {state.error && (
              <p className="chat-error" role="alert">
                {state.error}
              </p>
            )}
            {state.step === 'email' && (
              <form className="chat-form" onSubmit={submit(() => chat.identify())}>
                <p>Enter your email to start or continue a conversation.</p>
                <label>
                  Email
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={state.email}
                    onChange={(e) => chat.patch({ email: e.target.value })}
                  />
                </label>
                <small>
                  We’ll send a verification code on a new browser. Your email stays private.
                </small>
                <button disabled={state.busy}>Send verification code</button>
              </form>
            )}
            {state.step === 'code' && (
              <form className="chat-form" onSubmit={submit(() => chat.verify())}>
                <p>Enter the code sent to {state.email}.</p>
                <label>
                  Verification code
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    required
                    maxLength={6}
                    value={state.code}
                    onChange={(e) => chat.patch({ code: e.target.value })}
                  />
                </label>
                <button disabled={state.busy}>Continue</button>
                <button
                  type="button"
                  className="chat-quiet"
                  disabled={state.busy}
                  onClick={() => chat.patch({ step: 'email', error: '' })}
                >
                  Change email or request another code
                </button>
              </form>
            )}
            {state.step === 'nickname' && (
              <form className="chat-form" onSubmit={submit(() => chat.nickname())}>
                <label>
                  What should I call you?
                  <input
                    autoComplete="nickname"
                    required
                    maxLength={60}
                    value={state.nickname}
                    onChange={(e) => chat.patch({ nickname: e.target.value })}
                  />
                </label>
                <button disabled={state.busy}>Start conversation</button>
              </form>
            )}
            {state.step === 'owner' && (
              <form className="chat-form" onSubmit={submit(() => chat.owner())}>
                <label>
                  Owner PIN
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="current-password"
                    required
                    maxLength={128}
                    value={state.pin}
                    onChange={(e) => chat.patch({ pin: e.target.value })}
                  />
                </label>
                <button disabled={state.busy}>Open inbox</button>
                <button
                  className="chat-quiet"
                  type="button"
                  onClick={() => chat.patch({ step: state.role ? 'chat' : 'email' })}
                >
                  Back
                </button>
              </form>
            )}
            {state.step === 'chat' && (
              <>
                {state.role === 'owner' && !state.selected && (
                  <div className="chat-inbox">
                    {state.conversations.length === 0 && <p>No conversations yet.</p>}
                    {state.conversations.map((item) => (
                      <button key={item._id} onClick={() => void chat.select(item._id)}>
                        <strong>
                          {item.nickname || 'New recruiter'}{' '}
                          {item.unread > 0 && <span className="chat-badge">{item.unread}</span>}
                        </strong>
                        <small>{item.email}</small>
                        <span>{item.latest?.body || 'No messages yet'}</span>
                        {item.latest && (
                          <small>{new Date(item.latest.createdAt).toLocaleString()}</small>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {state.selected && (
                  <>
                    {state.role === 'owner' && (
                      <div className="chat-person">
                        <button onClick={() => void chat.select('')}>← Inbox</button>
                        <strong>{current?.nickname}</strong>
                        <small>{current?.email}</small>
                      </div>
                    )}
                    <div
                      ref={log}
                      className="chat-log"
                      role="log"
                      aria-label="Conversation messages"
                      aria-live="polite"
                    >
                      {state.more && (
                        <button
                          className="chat-quiet"
                          disabled={state.busy}
                          onClick={() => void chat.older()}
                        >
                          Load older messages
                        </button>
                      )}
                      {state.messages.length === 0 && (
                        <p className="chat-empty">
                          Say hello. Messages stay here, even when we’re offline.
                        </p>
                      )}
                      {state.messages.map((message) => (
                        <article
                          key={message._id}
                          className={`chat-message ${message.sender === state.role ? 'chat-mine' : ''}`}
                        >
                          <small>
                            {message.sender === state.role
                              ? 'You'
                              : message.sender === 'owner'
                                ? 'Cliff'
                                : current?.nickname}
                          </small>
                          <p>{message.body}</p>
                          <time dateTime={message.createdAt}>
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </time>
                        </article>
                      ))}
                    </div>
                    <form className="chat-composer" onSubmit={submit(() => chat.send())}>
                      <label className="sr-only" htmlFor="chat-message">
                        Message
                      </label>
                      <textarea
                        id="chat-message"
                        placeholder="Write a message…"
                        required
                        maxLength={4000}
                        rows={2}
                        value={state.draft}
                        onChange={(e) => chat.patch({ draft: e.target.value })}
                      />
                      <button disabled={state.busy || !state.draft.trim()}>Send</button>
                    </form>
                  </>
                )}
              </>
            )}
            {state.role && (
              <div className="chat-session">
                <span>{state.role === 'owner' ? 'Owner session' : state.recruiter?.email}</span>
                <button disabled={state.busy} onClick={() => void chat.logout()}>
                  Sign out
                </button>
              </div>
            )}
          </aside>,
          document.body,
        )}
    </>
  );
}
