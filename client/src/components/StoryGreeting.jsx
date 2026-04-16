import { useAuth } from "../auth/AuthContext";
import "./StoryGreeting.css";

export default function StoryGreeting() {
  const { user } = useAuth();

  return (
    <div className="story-greeting">
      <i className="bi bi-person-circle"></i>
      <span>
        {user?.name ? `Profilo di ${user.name}` : "Profilo"}
      </span>
    </div>
  );
}
