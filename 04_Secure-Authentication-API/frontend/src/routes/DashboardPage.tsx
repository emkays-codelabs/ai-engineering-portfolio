import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <p className="page-eyebrow">Account</p>
      <h1 className="page-title">Dashboard</h1>

      {user && (
        <section className="card">
          <dl className="detail-grid">
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>
                <span className={`tag ${user.role === "admin" ? "tag--admin" : ""}`}>{user.role}</span>
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`tag ${user.is_active ? "tag--active" : ""}`}>
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </dd>
            </div>
            <div>
              <dt>User ID</dt>
              <dd style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>{user.id}</dd>
            </div>
          </dl>
        </section>
      )}
    </AppLayout>
  );
}
