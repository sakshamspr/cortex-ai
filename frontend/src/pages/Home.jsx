import { useEffect } from "react";
import { useDispatch } from "react-redux";
import ArtifactPanel from "../components/ArtifactPanel";
import ChatArea from "../components/ChatArea";
import Sidebar from "../components/Sidebar";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";

function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    api.get("/api/me").then(({ data }) => dispatch(setUserData(data.user)));
  }, [dispatch]);

  return (
    <div className="h-screen flex bg-[#f5f0e8] text-[#292521] overflow-hidden">
      <Sidebar />
      <ChatArea />
      <ArtifactPanel />
    </div>
  );
}

export default Home;
