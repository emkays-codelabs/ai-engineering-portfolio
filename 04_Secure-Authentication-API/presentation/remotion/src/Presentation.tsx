import { Series } from "remotion";

import { ArchitectureScene, StackScene } from "./scenes/ArchitectureScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { CodeScene } from "./scenes/CodeScene";
import { ComparisonScene } from "./scenes/ComparisonScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { DemoScene } from "./scenes/DemoScene";
import { MetricScene } from "./scenes/MetricScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SecurityScene } from "./scenes/SecurityScene";
import { TimelineScene } from "./scenes/TimelineScene";
import { TitleScene } from "./scenes/TitleScene";
import { WorkflowScene } from "./scenes/WorkflowScene";

const REFRESH_CODE = `def refresh(self, refresh_token: str) -> tuple[str, str, str]:
    try:
        payload = decode_token(refresh_token)
    except jwt.PyJWTError as exc:
        raise InvalidRefreshTokenError() from exc

    if payload.get("type") != "refresh":
        raise InvalidRefreshTokenError()

    jti = payload["jti"]
    if self._token_repo.is_blacklisted(jti):
        raise InvalidRefreshTokenError()  # reuse/replay rejected

    ...
    self._token_repo.blacklist(jti=jti, ...)  # revoke before issuing new
    return self.issue_tokens(user)`;

const RBAC_CODE = `def get_current_user(
    token: str = Depends(_oauth2_scheme),
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    return auth_service.get_current_user(token)  # re-fetches live DB row


def get_current_admin_user(user: User = Depends(get_current_user)) -> User:
    require_role(user, Role.ADMIN)  # never trusts the JWT claim alone
    return user`;

export function Presentation() {
  return (
    <Series>
      <Series.Sequence durationInFrames={300}>
        <TitleScene
          title="Secure Authentication API"
          hook="A JWT auth service that implements what most tutorials skip."
        />
      </Series.Sequence>

      <Series.Sequence durationInFrames={1050}>
        <ProblemScene
          heading="What Most Auth Tutorials Skip"
          points={[
            "What happens when a stolen refresh token gets replayed?",
            "Can a client self-assign the Admin role?",
            "Where does the refresh token actually live in the browser — and why does it matter?",
          ]}
        />
      </Series.Sequence>

      <Series.Sequence durationInFrames={2250}>
        <ArchitectureScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={900}>
        <StackScene
          rows={[
            { layer: "Backend", tech: "FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic" },
            { layer: "Security", tech: "bcrypt (passlib), PyJWT, OAuth2 Password Flow" },
            { layer: "Frontend", tech: "React 18, TypeScript, Vite, React Router 7" },
            { layer: "Database", tech: "PostgreSQL 16 (deploy), SQLite (test)" },
            { layer: "Infra", tech: "Docker + Docker Compose, GitHub Actions" },
          ]}
        />
      </Series.Sequence>

      <Series.Sequence durationInFrames={1800}>
        <WorkflowScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={1050}>
        <CodeScene
          title="Refresh Rotation + Reuse Rejection"
          filename="backend/app/services/token_service.py"
          code={REFRESH_CODE}
          explanation="A replayed refresh token is rejected — verified by a test that rotates once, then replays the original."
        />
      </Series.Sequence>

      <Series.Sequence durationInFrames={1050}>
        <CodeScene
          title="RBAC — Server-Side, Every Request"
          filename="backend/app/core/dependencies.py"
          code={RBAC_CODE}
          explanation="Role is re-verified from the live DB row, never trusted from the JWT claim alone."
        />
      </Series.Sequence>

      <Series.Sequence durationInFrames={1350}>
        <SecurityScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={900}>
        <MetricScene
          heading="Testing — Built Test-First"
          metrics={[
            { label: "Backend tests", value: 80 },
            { label: "Frontend tests", value: 21 },
            { label: "Total, all green", value: 101 },
          ]}
          note="Every test watched to fail before it was watched to pass."
        />
      </Series.Sequence>

      <Series.Sequence durationInFrames={600}>
        <DashboardScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={2700}>
        <DemoScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={1050}>
        <ComparisonScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={750}>
        <MetricScene
          heading="Results"
          metrics={[
            { label: "Tests passing", value: 101 },
            { label: "Lint errors", value: 0 },
          ]}
          note="Load testing has not yet been performed — stated explicitly, not estimated."
        />
      </Series.Sequence>

      <Series.Sequence durationInFrames={600}>
        <TimelineScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={450}>
        <ClosingScene />
      </Series.Sequence>
    </Series>
  );
}
