import { Series } from "remotion";

import { ArchitectureScene, StackScene } from "./scenes/ArchitectureScene";
import { ChapterCard } from "./scenes/ChapterCard";
import { CodeScene } from "./scenes/CodeScene";
import { ComparisonScene } from "./scenes/ComparisonScene";
import { CreditsScene } from "./scenes/CreditsScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { DemoScene } from "./scenes/DemoScene";
import { MetricScene } from "./scenes/MetricScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { RequirementsScene } from "./scenes/RequirementsScene";
import { SecurityScene } from "./scenes/SecurityScene";
import { SequenceDetailScene } from "./scenes/SequenceDetailScene";
import { TimelineScene } from "./scenes/TimelineScene";
import { TitleScene } from "./scenes/TitleScene";
import { WorkflowScene } from "./scenes/WorkflowScene";

const MODEL_CODE = `class Role(enum.StrEnum):
    USER = "user"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid7)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[Role] = mapped_column(
        Enum(Role, native_enum=False), default=Role.USER, nullable=False
    )`;

const AUTH_SERVICE_CODE = `def register(self, email: str, password: str) -> User:
    if self._user_repo.get_by_email(email) is not None:
        raise EmailAlreadyRegisteredError(email)
    return self._user_repo.create(
        email=email, hashed_password=hash_password(password)
    )   # no role parameter exists — self-assigning Admin is structurally impossible

def authenticate(self, email: str, password: str) -> User:
    user = self._user_repo.get_by_email(email)
    credentials_valid = user is not None and verify_password(password, user.hashed_password)
    if not credentials_valid or not user.is_active:
        raise InvalidCredentialsError()   # one error for all three failure modes
    return user`;

const REFRESH_CODE = `def refresh(self, refresh_token: str) -> tuple[str, str, str]:
    try:
        payload = decode_token(refresh_token)
    except jwt.PyJWTError as exc:
        raise InvalidRefreshTokenError() from exc

    if payload.get("type") != "refresh":
        raise InvalidRefreshTokenError()

    jti = payload["jti"]
    if self._token_repo.is_blacklisted(jti):
        raise InvalidRefreshTokenError()          # reuse / replay rejected

    self._token_repo.blacklist(jti=jti, ...)      # revoke BEFORE issuing new
    return self.issue_tokens(user)`;

const RBAC_CODE = `def get_current_user(
    token: str = Depends(_oauth2_scheme),
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    return auth_service.get_current_user(token)   # re-fetches the live DB row


def get_current_admin_user(user: User = Depends(get_current_user)) -> User:
    require_role(user, Role.ADMIN)                # never trusts the JWT claim alone
    return user`;

const FRONTEND_AUTH_CODE = `useEffect(() => {
  (async () => {
    try {
      const tokens = await api.refresh();              // silent refresh against the
      const currentUser = await api.getCurrentUser(    // HttpOnly cookie on page load
        tokens.access_token
      );
      setAccessToken(tokens.access_token);             // access token lives in memory
      setUser(currentUser);                            // only — never localStorage
      setStatus("authenticated");
    } catch {
      setStatus("unauthenticated");
    }
  })();
}, []);`;

export function Presentation() {
  return (
    <Series>
      {/* ══ Chapter 01 — Project Introduction (3 min = 5400f) ══ */}
      <Series.Sequence durationInFrames={300}>
        <TitleScene
          title="Secure Authentication API"
          hook="Designing Intelligent Systems That Last"
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={2550}>
        <ProblemScene
          chapter="CH 01"
          eyebrow="01 · BUSINESS PROBLEM"
          heading="What Most Auth Tutorials Skip"
          points={[
            "What happens when a stolen refresh token gets replayed?",
            "Can a client self-assign the Admin role at registration?",
            "Where does the refresh token live in the browser — and why does that matter?",
          ]}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={2550}>
        <WorkflowScene chapter="CH 01" />
      </Series.Sequence>

      {/* ══ Chapter 02 — Business Requirements & PRD (4 min = 7200f) ══ */}
      <Series.Sequence durationInFrames={150}>
        <ChapterCard number="02" title="Business Requirements & PRD" window="03:00–07:00" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={7050}>
        <RequirementsScene chapter="CH 02" />
      </Series.Sequence>

      {/* ══ Chapter 03 — System Architecture (5 min = 9000f) ══ */}
      <Series.Sequence durationInFrames={150}>
        <ChapterCard number="03" title="System Architecture" window="07:00–12:00" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={4200}>
        <ArchitectureScene chapter="CH 03" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={4650}>
        <StackScene
          chapter="CH 03"
          rows={[
            { layer: "Backend", tech: "FastAPI · Pydantic v2 · SQLAlchemy 2.0 · Alembic" },
            { layer: "Security", tech: "bcrypt (passlib) · PyJWT · OAuth2 Password Flow" },
            { layer: "Frontend", tech: "React 18 · TypeScript · Vite · React Router 7" },
            { layer: "Database", tech: "PostgreSQL 16 (deploy) · SQLite (test)" },
            { layer: "Infrastructure", tech: "Docker · Docker Compose · GitHub Actions" },
            { layer: "Testing", tech: "Pytest · HTTPX · Vitest · React Testing Library" },
          ]}
        />
      </Series.Sequence>

      {/* ══ Chapter 04 — HLD & LLD Design (5 min = 9000f) ══ */}
      <Series.Sequence durationInFrames={150}>
        <ChapterCard number="04" title="HLD & LLD Design" window="12:00–17:00" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={4400}>
        <SequenceDetailScene
          chapter="CH 04"
          eyebrow="04 · LOW-LEVEL DESIGN"
          heading="TokenService.refresh() — Rotation State Machine"
          subheading="backend/app/services/token_service.py"
          steps={[
            "decode_token(refresh_token) — rejects bad signature / expiry",
            'payload["type"] == "refresh" — rejects wrong-typed tokens',
            "token_repo.is_blacklisted(jti) — rejects replay of a used token",
            "user_repo.get_by_id(sub) — rejects unknown or inactive user",
            "token_repo.blacklist(jti) — revokes the presented token",
            "issue_tokens(user) — returns a brand-new access/refresh pair",
          ]}
          invariant="A given refresh jti can be redeemed at most once — the blacklist-before-issue ordering is what closes the replay window."
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={4450}>
        <SequenceDetailScene
          chapter="CH 04"
          eyebrow="04 · LOW-LEVEL DESIGN"
          heading="RBAC Dependency Chain"
          subheading="backend/app/core/dependencies.py"
          steps={[
            "FastAPI extracts the bearer token from the Authorization header",
            "AuthService.get_current_user(token) decodes + validates all claims",
            "user_repo.get_by_id(sub) — fetches the LIVE row, not the JWT claim",
            "require_role(user, Role.ADMIN) — checked against that live row",
            "Route handler runs only with a verified, live, correctly-roled User",
          ]}
          invariant="Role is re-derived from the database on every request — a demoted or deactivated user loses access immediately, without waiting for token expiry."
        />
      </Series.Sequence>

      {/* ══ Chapter 05 — Implementation & Code Walkthrough (7 min = 12600f) ══ */}
      <Series.Sequence durationInFrames={150}>
        <ChapterCard number="05" title="Implementation & Code Walkthrough" window="17:00–24:00" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={3100}>
        <CodeScene
          chapter="CH 05"
          title="Data Model — UUIDv7 + Role Enum"
          filename="backend/app/models/user.py"
          code={MODEL_CODE}
          explanation="Time-sortable primary keys; role is a DB-level constrained enum, never free text."
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={3150}>
        <CodeScene
          chapter="CH 05"
          title="Registration Cannot Self-Assign Admin"
          filename="backend/app/services/auth_service.py"
          code={AUTH_SERVICE_CODE}
          explanation="One indistinguishable error for wrong password / unknown email / inactive — blocks account enumeration."
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={3150}>
        <CodeScene
          chapter="CH 05"
          title="Refresh Rotation + Reuse Rejection"
          filename="backend/app/services/token_service.py"
          code={REFRESH_CODE}
          explanation="Verified by a test that rotates once, then replays the original and asserts 401."
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={1600}>
        <CodeScene
          chapter="CH 05"
          title="RBAC — Server-Side, Every Request"
          filename="backend/app/core/dependencies.py"
          code={RBAC_CODE}
          explanation="Costs one DB read per request — buys immediate effect for demotion and deactivation."
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={1450}>
        <CodeScene
          chapter="CH 05"
          title="Frontend — Silent Session Restore"
          filename="frontend/src/features/auth/AuthContext.tsx"
          code={FRONTEND_AUTH_CODE}
          explanation="Session survives a page reload via the HttpOnly cookie, with no token in localStorage."
        />
      </Series.Sequence>

      {/* ══ Chapter 06 — Testing, Security & Quality (4 min = 7200f) ══ */}
      <Series.Sequence durationInFrames={150}>
        <ChapterCard number="06" title="Testing, Security & Quality" window="24:00–28:00" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={3600}>
        <MetricScene
          chapter="CH 06"
          eyebrow="06 · TESTING"
          heading="Built Test-First"
          metrics={[
            { label: "Backend tests", value: 80 },
            { label: "Frontend tests", value: 21 },
            { label: "Total, all green", value: 101 },
          ]}
          note="Every test was watched to fail — for the right reason — before it was watched to pass."
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={3450}>
        <SecurityScene chapter="CH 06" />
      </Series.Sequence>

      {/* ══ Chapter 07 — End-to-End Demo (5 min = 9000f) ══ */}
      <Series.Sequence durationInFrames={150}>
        <ChapterCard number="07" title="End-to-End Demo" window="28:00–33:00" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={8850}>
        <DemoScene chapter="CH 07" totalFrames={8850} />
      </Series.Sequence>

      {/* ══ Chapter 08 — Deployment & Operations (3 min = 5400f) ══ */}
      <Series.Sequence durationInFrames={150}>
        <ChapterCard number="08" title="Deployment & Operations" window="33:00–36:00" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={1800}>
        <DashboardScene chapter="CH 08" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={3450}>
        <SequenceDetailScene
          chapter="CH 08"
          eyebrow="08 · DEPLOYMENT"
          heading="Deployment Topology — Verified Live"
          subheading="docker-compose.yml"
          steps={[
            "docker compose up --build — API image (pinned tags, non-root user)",
            "db service starts; pg_isready healthcheck gates readiness",
            "api waits on db — depends_on: condition: service_healthy",
            "docker-entrypoint.sh runs `alembic upgrade head` before uvicorn",
            "GET /health verifies the real DB connection, not just liveness",
            "GitHub Actions CI — lint, test, Docker build (written + validated)",
          ]}
        />
      </Series.Sequence>

      {/* ══ Chapter 09 — Results, Challenges & Roadmap (2 min = 3600f) ══ */}
      <Series.Sequence durationInFrames={150}>
        <ChapterCard number="09" title="Results, Challenges & Roadmap" window="36:00–38:00" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={1150}>
        <MetricScene
          chapter="CH 09"
          eyebrow="09 · RESULTS"
          heading="Measured, Not Estimated"
          metrics={[
            { label: "Tests passing", value: 101 },
            { label: "Lint errors", value: 0 },
            { label: "Live demo checks passed", value: 14 },
          ]}
          note="Load testing has not been performed — stated explicitly rather than estimated."
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={1150}>
        <ComparisonScene chapter="CH 09" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={1150}>
        <TimelineScene chapter="CH 09" />
      </Series.Sequence>

      {/* ══ Chapter 10 — Conclusion & Credits (2 min = 3600f) ══ */}
      <Series.Sequence durationInFrames={150}>
        <ChapterCard number="10" title="Conclusion & Credits" window="38:00–40:00" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={3450}>
        <CreditsScene />
      </Series.Sequence>
    </Series>
  );
}
