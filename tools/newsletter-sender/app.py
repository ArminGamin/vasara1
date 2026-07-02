import os
import threading
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox, scrolledtext, ttk

import resend
from dotenv import load_dotenv

from email_utils import parse_email_list, personalize_html
from send_state import add_sent, get_sent_today

ROOT = Path(__file__).resolve().parents[2]
TOOL_DIR = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")
load_dotenv(ROOT / ".env.local")
load_dotenv(TOOL_DIR / ".env")

BATCH_SIZE = 100
DEFAULT_DAILY_LIMIT = 300
DEFAULT_FROM = "Vasaros Kampelis <v@vasaroskampelis.com>"


class NewsletterSenderApp(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Vasaros Kampelis — Newsletter Sender")
        self.geometry("980x820")
        self.minsize(860, 640)

        self.api_key = os.getenv("RESEND_API_KEY", "")
        self.sending = False

        self._build_ui()
        self._refresh_quota_label()

    def _get_api_key(self) -> str:
        return self.api_key_var.get().strip()

    def _build_ui(self) -> None:
        pad = {"padx": 10, "pady": 4}

        top = ttk.Frame(self)
        top.pack(fill=tk.X, **pad)

        ttk.Label(top, text="Resend API key:").grid(row=0, column=0, sticky=tk.W)
        self.api_key_var = tk.StringVar(value=self.api_key)
        api_row = ttk.Frame(top)
        api_row.grid(row=0, column=1, sticky=tk.EW, padx=(8, 0))
        self.api_key_entry = ttk.Entry(api_row, textvariable=self.api_key_var, width=62, show="•")
        self.api_key_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        self.show_key_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(
            api_row,
            text="Show",
            variable=self.show_key_var,
            command=self._toggle_api_key_visibility,
        ).pack(side=tk.LEFT, padx=(8, 0))

        ttk.Label(top, text="From:").grid(row=1, column=0, sticky=tk.W, pady=(8, 0))
        self.from_var = tk.StringVar(value=os.getenv("RESEND_FROM", DEFAULT_FROM))
        ttk.Entry(top, textvariable=self.from_var, width=70).grid(row=1, column=1, sticky=tk.EW, padx=(8, 0), pady=(8, 0))

        ttk.Label(top, text="Subject:").grid(row=2, column=0, sticky=tk.W, pady=(8, 0))
        self.subject_var = tk.StringVar(value="Mėlynas ar rožinis – kurią pusę pasirinksi šią vasarą?")
        ttk.Entry(top, textvariable=self.subject_var, width=70).grid(row=2, column=1, sticky=tk.EW, padx=(8, 0), pady=(8, 0))

        ttk.Label(top, text="Daily limit:").grid(row=3, column=0, sticky=tk.W, pady=(8, 0))
        limit_row = ttk.Frame(top)
        limit_row.grid(row=3, column=1, sticky=tk.W, padx=(8, 0), pady=(8, 0))
        self.limit_var = tk.IntVar(value=DEFAULT_DAILY_LIMIT)
        ttk.Spinbox(limit_row, from_=1, to=10000, textvariable=self.limit_var, width=8).pack(side=tk.LEFT)
        self.quota_label = ttk.Label(limit_row, text="")
        self.quota_label.pack(side=tk.LEFT, padx=(12, 0))

        top.columnconfigure(1, weight=1)

        if not self.api_key:
            ttk.Label(
                self,
                text="Tip: paste RESEND_API_KEY above, or add it to .env (project root or tools/newsletter-sender/.env)",
                foreground="#b45309",
            ).pack(anchor=tk.W, padx=10)

        paned = ttk.Panedwindow(self, orient=tk.VERTICAL)
        paned.pack(fill=tk.BOTH, expand=True, padx=10, pady=8)

        email_frame = ttk.LabelFrame(paned, text="Recipients (one email per line, paste list)")
        paned.add(email_frame, weight=1)
        self.emails_text = scrolledtext.ScrolledText(email_frame, height=10, wrap=tk.NONE, font=("Consolas", 10))
        self.emails_text.pack(fill=tk.BOTH, expand=True, padx=8, pady=8)

        html_frame = ttk.LabelFrame(paned, text="HTML body (supports {{{EMAIL}}} per recipient)")
        paned.add(html_frame, weight=2)

        html_toolbar = ttk.Frame(html_frame)
        html_toolbar.pack(fill=tk.X, padx=8, pady=(8, 0))
        ttk.Button(html_toolbar, text="Load HTML file…", command=self._load_html_file).pack(side=tk.LEFT)
        ttk.Button(html_toolbar, text="Load promo template", command=self._load_promo_template).pack(side=tk.LEFT, padx=(8, 0))
        ttk.Label(
            html_toolbar,
            text="Note: {{{RESEND_UNSUBSCRIBE_URL}}} only works in Resend Broadcast — use mailto in HTML for this tool.",
            foreground="#64748b",
        ).pack(side=tk.LEFT, padx=(12, 0))

        self.html_text = scrolledtext.ScrolledText(html_frame, height=16, wrap=tk.NONE, font=("Consolas", 9))
        self.html_text.pack(fill=tk.BOTH, expand=True, padx=8, pady=8)

        log_frame = ttk.LabelFrame(self, text="Log")
        log_frame.pack(fill=tk.BOTH, expand=False, padx=10, pady=(0, 8))
        self.log_text = scrolledtext.ScrolledText(log_frame, height=8, state=tk.DISABLED, font=("Consolas", 9))
        self.log_text.pack(fill=tk.BOTH, expand=True, padx=8, pady=8)

        actions = ttk.Frame(self)
        actions.pack(fill=tk.X, padx=10, pady=(0, 10))

        self.parse_btn = ttk.Button(actions, text="Parse list", command=self._parse_list)
        self.parse_btn.pack(side=tk.LEFT)

        self.test_btn = ttk.Button(actions, text="Test send (first email)", command=self._test_send)
        self.test_btn.pack(side=tk.LEFT, padx=(8, 0))

        self.send_btn = ttk.Button(actions, text="Send", command=self._confirm_send)
        self.send_btn.pack(side=tk.RIGHT)

        self.parsed_emails: list[str] = []

    def _toggle_api_key_visibility(self) -> None:
        self.api_key_entry.config(show="" if self.show_key_var.get() else "•")

    def _refresh_quota_label(self) -> None:
        sent = get_sent_today()
        limit = max(1, int(self.limit_var.get() or DEFAULT_DAILY_LIMIT))
        remaining = max(0, limit - sent)
        self.quota_label.config(text=f"Sent today: {sent} / {limit}  ·  Remaining: {remaining}")

    def _log(self, message: str) -> None:
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)

    def _load_promo_template(self) -> None:
        path = TOOL_DIR / "promo-email.html"
        if not path.is_file():
            messagebox.showerror("Not found", f"Missing {path}")
            return
        content = path.read_text(encoding="utf-8")
        self.html_text.delete("1.0", tk.END)
        self.html_text.insert("1.0", content)
        self._log(f"Loaded promo template: {path}")

    def _load_html_file(self) -> None:
        path = filedialog.askopenfilename(
            title="Select HTML file",
            filetypes=[("HTML", "*.html"), ("All files", "*.*")],
        )
        if not path:
            return
        content = Path(path).read_text(encoding="utf-8")
        self.html_text.delete("1.0", tk.END)
        self.html_text.insert("1.0", content)
        self._log(f"Loaded HTML: {path}")

    def _parse_list(self) -> None:
        raw = self.emails_text.get("1.0", tk.END)
        emails, skipped = parse_email_list(raw)
        self.parsed_emails = emails
        self._log(f"Parsed {len(emails)} unique valid emails.")
        if skipped:
            self._log(f"Skipped {len(skipped)} invalid lines (first: {skipped[0][:60]}…)")
        self._refresh_quota_label()

    def _get_payload_inputs(self) -> tuple[str, str, str] | None:
        from_addr = self.from_var.get().strip()
        subject = self.subject_var.get().strip()
        html = self.html_text.get("1.0", tk.END).strip()

        if not self._get_api_key():
            messagebox.showerror("Missing API key", "Enter your Resend API key (re_…)")
            return None
        if not from_addr:
            messagebox.showerror("Missing from", "Enter a From address")
            return None
        if not subject:
            messagebox.showerror("Missing subject", "Enter a subject")
            return None
        if not html:
            messagebox.showerror("Missing HTML", "Paste or load HTML body")
            return None
        return from_addr, subject, html

    def _ensure_parsed(self) -> list[str]:
        if not self.parsed_emails:
            raw = self.emails_text.get("1.0", tk.END)
            emails, _ = parse_email_list(raw)
            self.parsed_emails = emails
        return self.parsed_emails

    def _send_one(self, to_email: str, from_addr: str, subject: str, html: str) -> None:
        resend.api_key = self._get_api_key()
        resend.Emails.send(
            {
                "from": from_addr,
                "to": [to_email],
                "subject": subject,
                "html": personalize_html(html, to_email),
            }
        )

    def _send_batch(self, batch: list[str], from_addr: str, subject: str, html: str) -> tuple[int, list[str]]:
        resend.api_key = self._get_api_key()
        params = [
            {
                "from": from_addr,
                "to": [email],
                "subject": subject,
                "html": personalize_html(html, email),
            }
            for email in batch
        ]
        options: resend.Batch.SendOptions = {"batch_validation": "permissive"}
        result = resend.Batch.send(params, options)
        errors = []
        if isinstance(result, dict):
            errors = result.get("errors") or []
        sent = len(batch) - len(errors)
        return sent, errors

    def _test_send(self) -> None:
        payload = self._get_payload_inputs()
        if not payload:
            return
        from_addr, subject, html = payload
        emails = self._ensure_parsed()
        if not emails:
            messagebox.showerror("No emails", "Paste and parse a recipient list first")
            return

        test_to = emails[0]
        try:
            self._send_one(test_to, from_addr, subject, html)
            add_sent(1)
            self._refresh_quota_label()
            self._log(f"Test sent to {test_to}")
            messagebox.showinfo("Test sent", f"Sent test email to {test_to}")
        except Exception as exc:
            self._log(f"Test failed: {exc}")
            messagebox.showerror("Test failed", str(exc))

    def _confirm_send(self) -> None:
        if self.sending:
            return
        payload = self._get_payload_inputs()
        if not payload:
            return

        emails = self._ensure_parsed()
        if not emails:
            messagebox.showerror("No emails", "No valid emails in list")
            return

        sent_today = get_sent_today()
        limit = max(1, int(self.limit_var.get() or DEFAULT_DAILY_LIMIT))
        remaining = max(0, limit - sent_today)
        if remaining == 0:
            messagebox.showwarning("Daily limit reached", f"Already sent {sent_today} today (limit {limit}).")
            return

        to_send = emails[:remaining]
        if len(to_send) < len(emails):
            msg = (
                f"Will send {len(to_send)} of {len(emails)} emails today "
                f"(daily limit {limit}, already sent {sent_today}).\n\nContinue?"
            )
        else:
            msg = f"Send {len(to_send)} emails now?"

        if not messagebox.askyesno("Confirm send", msg):
            return

        self.sending = True
        self.send_btn.config(state=tk.DISABLED)
        self.test_btn.config(state=tk.DISABLED)
        threading.Thread(
            target=self._run_send,
            args=(to_send, *payload),
            daemon=True,
        ).start()

    def _run_send(self, emails: list[str], from_addr: str, subject: str, html: str) -> None:
        total_sent = 0
        total_errors = 0

        try:
            for i in range(0, len(emails), BATCH_SIZE):
                batch = emails[i : i + BATCH_SIZE]
                batch_no = i // BATCH_SIZE + 1
                self.after(0, lambda n=batch_no, c=len(batch): self._log(f"Sending batch {n} ({c} emails)…"))

                try:
                    sent, errors = self._send_batch(batch, from_addr, subject, html)
                    total_sent += sent
                    total_errors += len(errors)
                    add_sent(sent)
                    self.after(0, self._refresh_quota_label)
                    self.after(
                        0,
                        lambda s=sent, e=len(errors): self._log(f"  Batch done: {s} sent, {e} failed"),
                    )
                    for err in errors[:5]:
                        self.after(0, lambda m=str(err): self._log(f"  Error: {m}"))
                except Exception as exc:
                    self.after(0, lambda m=str(exc): self._log(f"  Batch failed: {m}"))

            self.after(
                0,
                lambda: self._log(f"Finished. Sent {total_sent}, failed {total_errors}."),
            )
            self.after(
                0,
                lambda: messagebox.showinfo(
                    "Done",
                    f"Sent {total_sent} emails.\nFailed: {total_errors}.\nCheck Resend dashboard for delivery status.",
                ),
            )
        finally:
            self.after(0, self._send_finished)

    def _send_finished(self) -> None:
        self.sending = False
        self.send_btn.config(state=tk.NORMAL)
        self.test_btn.config(state=tk.NORMAL)


def main() -> None:
    app = NewsletterSenderApp()
    app.mainloop()


if __name__ == "__main__":
    main()
