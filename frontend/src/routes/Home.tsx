import { Outlet } from "react-router-dom";
import BannerContainer from "../components/BannerContainer/BannerContainer";
import ContainerRow from "../components/ContainerRow/ContainerRow";
import FeedToggler from "../components/FeedToggler/FeedToggler";
import PopularTags from "../components/PopularTags/PopularTags";
import { useAuth } from "../context/AuthContext";
import FeedProvider from "../context/FeedContext";

function Home() {
  const { isAuth } = useAuth();

  return (
    <div className="home-page">
      {!isAuth && (
        <BannerContainer>
          <h1 className="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </BannerContainer>
      )}
      <ContainerRow page>
        <FeedProvider>
          <div className="col-md-9">
            <FeedToggler />
            <Outlet />
          </div>

          <PopularTags />
        </FeedProvider>
      </ContainerRow>
    </div>
  );
}

export default Home;
