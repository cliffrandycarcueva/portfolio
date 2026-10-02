export interface Recruiter {
  _id: string;
  email: string;
  nickname: string;
}
export interface Message {
  _id: string;
  conversationId: string;
  sender: 'owner' | 'recruiter';
  body: string;
  createdAt: string;
  read: boolean;
}
export interface Conversation extends Recruiter {
  unread: number;
  latest?: Message;
}
type Step = 'email' | 'code' | 'nickname' | 'owner' | 'chat';
export interface ChatState {
  open: boolean;
  role: 'owner' | 'recruiter' | null;
  recruiter: Recruiter | null;
  step: Step;
  email: string;
  code: string;
  nickname: string;
  pin: string;
  draft: string;
  challengeId: string;
  conversations: Conversation[];
  selected: string;
  messages: Message[];
  busy: boolean;
  error: string;
  connected: boolean;
  more: boolean;
}
const initial = (): ChatState => ({
  open: false,
  role: null,
  recruiter: null,
  step: 'email',
  email: '',
  code: '',
  nickname: '',
  pin: '',
  draft: '',
  challengeId: '',
  conversations: [],
  selected: '',
  messages: [],
  busy: false,
  error: '',
  connected: false,
  more: false,
});

/** Framework-neutral state and transport. Each framework owns its rendered UI. */
export class Messaging {
  state = initial();
  private subscribers = new Set<() => void>();
  private stream?: EventSource;
  private poll?: ReturnType<typeof setInterval>;
  private retry?: { body: string; requestId: string; conversation: string };
  private generation = 0;
  private refreshRunning = false;
  private refreshAgain = false;
  private stopped = false;
  subscribe = (callback: () => void) => {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  };
  snapshot = () => this.state;
  patch(values: Partial<ChatState>) {
    this.state = { ...this.state, ...values };
    this.subscribers.forEach((fn) => fn());
  }
  get unread() {
    return this.state.conversations.reduce((sum, item) => sum + item.unread, 0);
  }
  private async api<T = any>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`/api/${path}`, {
      credentials: 'same-origin',
      ...(body !== undefined
        ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        : {}),
    });
    if (!response.ok) {
      if (response.status === 401 && this.state.role && !path.startsWith('auth/')) {
        this.disconnect();
        this.generation++;
        this.patch({
          role: null,
          recruiter: null,
          conversations: [],
          messages: [],
          selected: '',
          step: 'email',
        });
      }
      const data = await response.json().catch(() => ({}));
      throw new Error(
        data.message || 'Messaging is temporarily unavailable. Please use the email link.',
      );
    }
    return response.json();
  }
  private async action(task: () => Promise<void>) {
    if (this.state.busy) return;
    this.patch({ busy: true, error: '' });
    try {
      await task();
    } catch (error) {
      this.patch({ error: error instanceof Error ? error.message : 'Please try again.' });
    } finally {
      this.patch({ busy: false });
    }
  }
  private onOwner = () => {
    this.patch({ open: true, error: '', step: this.state.role === 'owner' ? 'chat' : 'owner' });
    if (this.state.role === 'owner') void this.refresh();
  };
  private onVisible = () => {
    if (!document.hidden && this.state.role) void this.refresh();
  };
  async start() {
    this.stopped = false;
    const generation = ++this.generation;
    window.addEventListener('portfolio-owner', this.onOwner);
    document.addEventListener('visibilitychange', this.onVisible);
    const conversation = new URLSearchParams(location.search).get('conversation');
    if (conversation) this.patch({ selected: conversation, open: true, step: 'owner' });
    try {
      const session = await this.api('session');
      if (this.stopped || generation !== this.generation) return;
      if (session.role) await this.accept(session);
    } catch {
      /* The portfolio remains usable when messaging is not configured. */
    }
  }
  stop() {
    this.stopped = true;
    this.generation++;
    this.disconnect();
    window.removeEventListener('portfolio-owner', this.onOwner);
    document.removeEventListener('visibilitychange', this.onVisible);
  }
  private disconnect() {
    this.stream?.close();
    this.stream = undefined;
    clearInterval(this.poll);
    this.patch({ connected: false });
  }
  private async accept(session: { role: ChatState['role']; recruiter: Recruiter | null }) {
    this.disconnect();
    this.generation++;
    this.patch({
      ...session,
      pin: '',
      code: '',
      messages: [],
      conversations: [],
      selected:
        session.role === 'owner'
          ? (new URLSearchParams(location.search).get('conversation') ??
            (this.state.role === 'owner' ? this.state.selected : ''))
          : (session.recruiter?._id ?? ''),
      step: session.role === 'recruiter' && !session.recruiter?.nickname ? 'nickname' : 'chat',
    });
    this.stream = new EventSource('/api/events');
    this.stream.onopen = () => {
      this.patch({ connected: true });
      void this.refresh();
    };
    this.stream.onmessage = () => {
      void this.refresh();
    };
    this.stream.onerror = () => {
      this.patch({ connected: false });
    };
    this.poll = setInterval(() => {
      if (!document.hidden) void this.refresh();
    }, 30000);
    await this.refresh();
  }
  open() {
    this.patch({ open: true, error: '' });
    if (this.state.role) void this.refresh();
  }
  close() {
    this.patch({ open: false, pin: '', error: '' });
  }
  async identify() {
    await this.action(async () => {
      const result = await this.api('auth/email', { email: this.state.email });
      this.patch({ challengeId: result.challengeId, step: 'code', code: '' });
    });
  }
  async verify() {
    await this.action(async () => {
      await this.accept(
        await this.api('auth/verify', {
          challengeId: this.state.challengeId,
          code: this.state.code,
        }),
      );
    });
  }
  async nickname() {
    await this.action(async () => {
      await this.accept(await this.api('auth/nickname', { nickname: this.state.nickname }));
    });
  }
  async owner() {
    await this.action(async () => {
      await this.accept(await this.api('auth/owner', { pin: this.state.pin }));
    });
  }
  async logout() {
    await this.action(async () => {
      await this.api('auth/logout', {});
      this.disconnect();
      this.generation++;
      this.retry = undefined;
      this.patch({ ...initial(), open: true });
    });
  }
  async select(id: string) {
    this.generation++;
    this.retry = undefined;
    this.patch({ selected: id, messages: [], draft: '', error: '' });
    await this.refresh();
  }
  async refresh() {
    if (!this.state.role || this.stopped) return;
    if (this.refreshRunning) {
      this.refreshAgain = true;
      return;
    }
    this.refreshRunning = true;
    const generation = this.generation;
    try {
      const conversations = await this.api<Conversation[]>('conversations');
      if (generation !== this.generation || this.stopped) return;
      this.patch({ conversations });
      const selected = this.state.selected;
      if (selected && this.state.open && this.state.step === 'chat') {
        const result = await this.api<{ messages: Message[]; more: boolean }>(
          `conversations/${selected}/messages`,
        );
        if (generation !== this.generation || selected !== this.state.selected || this.stopped)
          return;
        const oldMessages = this.state.messages.filter(
          (message) =>
            result.messages[0] &&
            (message.createdAt < result.messages[0].createdAt ||
              (message.createdAt === result.messages[0].createdAt &&
                message._id < result.messages[0]._id)),
        );
        this.patch({
          messages: [...oldMessages, ...result.messages],
          more: oldMessages.length ? this.state.more : result.more,
        });
        if (
          this.state.open &&
          this.state.step === 'chat' &&
          !document.hidden &&
          result.messages.some((message) => !message.read && message.sender !== this.state.role)
        )
          await this.api(`conversations/${selected}/read`, {
            through: result.messages.at(-1)!._id,
          });
      }
    } catch (error) {
      if (this.state.open)
        this.patch({
          error: error instanceof Error ? error.message : 'Could not refresh messages.',
        });
    } finally {
      this.refreshRunning = false;
      if (this.refreshAgain) {
        this.refreshAgain = false;
        void this.refresh();
      }
    }
  }
  async older() {
    await this.action(async () => {
      const id = this.state.selected;
      const first = this.state.messages[0]?._id;
      if (!first) return;
      const result = await this.api(`conversations/${id}/messages?before=${first}`);
      if (id === this.state.selected)
        this.patch({ messages: [...result.messages, ...this.state.messages], more: result.more });
    });
  }
  async send() {
    await this.action(async () => {
      const body = this.state.draft.trim();
      const conversation = this.state.selected;
      if (!body || !conversation) return;
      if (!this.retry || this.retry.body !== body || this.retry.conversation !== conversation)
        this.retry = { body, conversation, requestId: crypto.randomUUID() };
      await this.api(`conversations/${conversation}/messages`, this.retry);
      this.retry = undefined;
      this.patch({ draft: '' });
      await this.refresh();
    });
  }
}
