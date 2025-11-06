import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { listPlants } from "../services/plants";

export default function HomePage() {
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState("signIn"); // signIn | signUp
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authMessage, setAuthMessage] = useState(null);
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const [plants, setPlants] = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(false);
  const [plantsError, setPlantsError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let abort = false;

    if (!session) {
      setPlants([]);
      setPlantsError(null);
      return;
    }

    setPlantsLoading(true);
    setPlantsError(null);

    listPlants()
      .then((items) => {
        if (!abort) setPlants(items);
      })
      .catch((error) => {
        if (!abort) setPlantsError(error.message);
      })
      .finally(() => {
        if (!abort) setPlantsLoading(false);
      });

    return () => {
      abort = true;
    };
  }, [session]);

  const handleCredentialChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
      if (authMode === "signIn") {
        const { error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
        });
        if (error) throw error;
        if (!data.user) {
          setAuthMessage(
            "Check your email to confirm your account before signing in."
          );
        } else {
          setAuthMessage(
            "Account created! You can sign in once you confirm the email from Supabase."
          );
        }
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const hasPlants = useMemo(() => plants.length > 0, [plants]);

  return (
    <div className="home-page">
      <h2>Welcome to Harvestly</h2>
      <p>Your go-to app for managing your harvests efficiently.</p>

      {!session && (
        <section className="auth-gate">
          <h3>
            {authMode === "signIn"
              ? "Sign in to view your plants"
              : "Create an account to save your plants"}
          </h3>
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Email
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleCredentialChange}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleCredentialChange}
                required
              />
            </label>
            <button type="submit" disabled={authLoading}>
              {authLoading
                ? authMode === "signIn"
                  ? "Signing in..."
                  : "Creating account..."
                : authMode === "signIn"
                ? "Sign In"
                : "Sign Up"}
            </button>
          </form>
          <button
            type="button"
            className="auth-mode-toggle"
            onClick={() =>
              setAuthMode((mode) => (mode === "signIn" ? "signUp" : "signIn"))
            }
            disabled={authLoading}
          >
            {authMode === "signIn"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
          {authError && <p className="error-message">{authError}</p>}
          {authMessage && <p className="auth-message">{authMessage}</p>}
          {authMode === "signUp" && (
            <p className="auth-help">
              After signing up, Supabase will email a confirmation link. Follow
              it before logging in.
            </p>
          )}
        </section>
      )}

      {session && (
        <section className="plants-section">
          <div className="plants-header">
            <h3>Your plants</h3>
            <button onClick={handleLogout} disabled={authLoading}>
              {authLoading ? "Signing out..." : "Sign Out"}
            </button>
          </div>
          {plantsLoading && <p>Loading plants…</p>}
          {plantsError && <p className="error-message">{plantsError}</p>}
          {!plantsLoading && !plantsError && !hasPlants && (
            <p>You haven&apos;t added any plants yet.</p>
          )}
          {!plantsLoading && !plantsError && hasPlants && (
            <ul className="plant-list">
              {plants.map((plant) => (
                <li key={plant.id} className="plant-card">
                  <h4>{plant.nickname}</h4>
                  {plant.official_name && (
                    <p className="plant-official">{plant.official_name}</p>
                  )}
                  {plant.sun_level && (
                    <p className="plant-detail">
                      <strong>Sun:</strong> {plant.sun_level}
                    </p>
                  )}
                  {plant.difficulty && (
                    <p className="plant-detail">
                      <strong>Difficulty:</strong> {plant.difficulty}
                    </p>
                  )}
                  {plant.notes && <p className="plant-notes">{plant.notes}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
