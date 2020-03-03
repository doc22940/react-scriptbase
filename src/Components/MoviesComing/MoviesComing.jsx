import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { MovieConsumer } from "../../Context";
import LoadMore from "../LoadMore/LoadMore";
import LazyLoad from "react-lazyload";
import { Link } from "react-router-dom";

const MoviesComing = () => {
  return (
    <Container className="homePageMovies mt-3">
      <Row>
        <Col>
          <MovieConsumer>
            {value => {
              return (
                <>
                  <>
                    {value.coming.slice(0, value.visible).map(i => {
                      return (
                        <div className="card text-white fade-in" key={i.id}>
                          <Link
                            to={`${i.id}`}
                            key={i.id}
                            onClick={() => {
                              value.handleClick(i.id);
                              value.refreshPage();
                            }}
                          >
                            <LazyLoad>
                              <img
                                src={`https://image.tmdb.org/t/p/w154${i.poster_path}`}
                                className="card-img"
                                alt={i.title}
                              />
                            </LazyLoad>
                          </Link>

                          <div className="">
                            <h6 className="card-title voteAverage">
                              {i.vote_average}
                            </h6>
                          </div>
                          <div className="">
                            <h6
                              className="card-title hearts"
                              onClick={() => value.addFavorite(i.poster_path)}
                            >
                              {value.currentUser ? (
                                value.favorite.includes(i.poster_path) ? (
                                  <i
                                    className="fa fa-heart"
                                    aria-hidden="true"
                                    style={{ color: "red" }}
                                  ></i>
                                ) : (
                                  <i
                                    className="fa fa-heart"
                                    aria-hidden="true"
                                  ></i>
                                )
                              ) : (
                                <Link to="/signin" style={{ color: "#FDFFFC" }}>
                                  <i
                                    className="fa fa-heart"
                                    aria-hidden="true"
                                  ></i>
                                </Link>
                              )}
                            </h6>
                          </div>
                        </div>
                      );
                    })}
                  </>
                  <LoadMore />
                </>
              );
            }}
          </MovieConsumer>
        </Col>
      </Row>
    </Container>
  );
};

export default React.memo(MoviesComing);
