import React, { Component, createContext } from "react";
import { TMDB_KEY } from "./config.js";
import axios from "axios";
import {
  auth,
  createUserProfileDocument
} from "../src/components/firebase/firebase.utils.js";
import { Persist } from "react-persist";

export const MovieContext = createContext();

class MovieContextProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //empty array because we are fetching an array from tmdb database
      trending: [],
      popular: [],
      now: [],
      coming: [],
      top: [],
      details: "",
      genres: [],
      cast: [],
      id: "",
      companies: [],
      countries: [],
      similar: [],
      videos: [],
      //there are two different arrays for searching movies
      //first is to fetch, second is to search and see results
      movies: [],
      moviesResult: [],
      //modal is closed at first, after state is true, component will show
      modalOpen: false,
      //number of movies that will be visible at first in homepage
      visible: 10,
      //state to understand if page is refreshed
      pageRefreshed: false,
      currentUser: null,
      //favorite movies array to store favorite movies
      favorite: []
    };
  }

  //we need this to sign out, currently user is not signed out
  unsubscribeFromAuth = null;

  componentDidMount = () => {
    this.getTrending();
    this.getPopular();
    this.cleanState();
    this.handleClick();
    this.searchMovie();
    this.clearSearch();

    // set the currentusers state as signed in user with google
    //userAuth comes from firebase
    this.unsubscribeFromAuth = auth.onAuthStateChanged(async userAuth => {
      //if userAuth exists(have any value besides null)
      if (userAuth) {
        //userRef is waiting for the function we created in firebase utils that created a snapshot, which takes userAuth as value
        const userRef = await createUserProfileDocument(userAuth);

        userRef.onSnapshot(snapShot => {
          this.setState({
            currentUser: {
              id: snapShot.id,
              ...snapShot.data()
            }
          });
        });
      } else {
        //if user logs out then state will be userAuth(if theres no userAuth then its null)
        this.setState({
          currentUser: userAuth
        });
      }
    });
  };

  //this is how user will sign out
  componentWillUnmount() {
    this.unsubscribeFromAuth();
  }

  //cleans the states for movie lists so they wouldnt stack up
  cleanState = () => {
    this.setState({
      popular: [],
      now: [],
      coming: [],
      top: []
    });
  };

  getTrending = () => {
    axios
      .get(
        `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_KEY}`
      )
      .then(response => {
        const apiResponse = response.data;
        this.setState({
          trending: apiResponse.results
        });
        // console.log(apiResponse.results);
      })
      .catch(error => {
        console.log(error);
      });
  };

  getPopular = () => {
    this.cleanState();
    axios
      .get(
        `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=1`
      )
      .then(response => {
        const apiResponse = response.data;
        this.setState({
          popular: apiResponse.results
        });
        // console.log(apiResponse.results);
      })
      .catch(error => {
        console.log(error);
      });
  };

  getNow = () => {
    this.cleanState();
    axios
      .get(
        `
https://api.themoviedb.org/3/movie/now_playing?api_key=${TMDB_KEY}&language=en-US&page=1`
      )
      .then(response => {
        const apiResponse = response.data;
        this.setState({
          now: apiResponse.results
        });
        // console.log(apiResponse.results);
      })
      .catch(error => {
        console.log(error);
      });
    // console.log("worked");
  };

  getComing = () => {
    this.cleanState();
    axios
      .get(
        `
https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_KEY}&language=en-US&page=1`
      )
      .then(response => {
        const apiResponse = response.data;
        this.setState({
          coming: apiResponse.results
        });
        // console.log(apiResponse.results);
      })
      .catch(error => {
        console.log(error);
      });
  };

  getTop = () => {
    this.cleanState();
    axios
      .get(
        `
https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_KEY}&language=en-US&page=1`
      )
      .then(response => {
        const apiResponse = response.data;
        this.setState({
          top: apiResponse.results
        });
        // console.log(apiResponse.results);
      })
      .catch(error => {
        console.log(error);
      });
  };

  getDetails = () => {
    axios
      .get(
        `https://api.themoviedb.org/3/movie/${this.state.id}?api_key=${TMDB_KEY}&language=en-US`
      )
      .then(response => {
        const apiResponse = response.data;
        // console.log(this.state.id);
        this.setState(
          {
            details: apiResponse,
            genres: apiResponse.genres,
            companies: apiResponse.production_companies,
            countries: apiResponse.production_countries
          },
          () => console.log(apiResponse)
        );
      })
      .catch(error => {
        console.log(error);
      });
  };

  getCast = () => {
    axios
      .get(
        `https://api.themoviedb.org/3/movie/${this.state.id}/credits?api_key=${TMDB_KEY}&language=en-US`
      )
      .then(response => {
        const apiResponse = response.data;
        this.setState({
          cast: apiResponse.cast
        });
        // console.log(apiResponse.cast);
      })
      .catch(error => {
        console.log(error);
      });
  };

  getSimilar = () => {
    axios
      .get(
        `https://api.themoviedb.org/3/movie/${this.state.id}/similar?api_key=${TMDB_KEY}&language=en-US&page=1`
      )
      .then(response => {
        const apiResponse = response.data;
        this.setState({
          similar: apiResponse.results
        });
        // console.log(apiResponse.results);
      })
      .catch(error => {
        console.log(error);
      });
  };

  getVideos = () => {
    axios
      .get(
        `https://api.themoviedb.org/3/movie/${this.state.id}/videos?api_key=${TMDB_KEY}&language=en-US&page=1`
      )
      .then(response => {
        const apiResponse = response.data;
        this.setState({
          videos: apiResponse.results
        });
        // console.log(apiResponse.results);
      })
      .catch(error => {
        console.log(error);
      });
  };

  //search from movies state, store to moviesResult array in state
  searchMovie = () => {
    axios
      .get(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${this.state.movies}&language=en-US&page=1&include_adult=false`
      )
      .then(response => {
        const apiResponse = response.data;
        this.setState({
          moviesResult: apiResponse.results
        });
        // console.log(apiResponse.results);
      })
      .catch(error => {
        console.log(error);
      });
  };

  //this will get the id of clicked element and set the id state with id it got from the element
  //https://stackoverflow.com/questions/44325272/getting-the-id-of-a-clicked-element-from-rendered-list
  handleClick = id => {
    this.setState(
      {
        id: id
      },
      // how to put two callback functions within setState
      // https://stackoverflow.com/questions/53788156/passing-multiple-functions-as-callback-in-setstate
      () => {
        this.getDetails();
        this.getCast();
        this.getSimilar();
        this.getVideos();
      }
    );
  };
  // gets the value of inputs
  handleChange = e => {
    this.setState(
      {
        movies: e.target.value
      },
      () => {
        this.searchMovie();
      }
    );
  };

  handleSubmit = e => {
    e.preventDefault();
    this.searchMovie();
    //.reset() to reset searchbar
    e.target.reset();
  };

  openModal = () => {
    this.setState({
      modalOpen: true
    });
  };

  closeModal = () => {
    this.setState({
      modalOpen: false
    });
  };

  clearSearch = () => {
    this.setState({
      movies: [],
      moviesResult: []
    });
  };

  //clears the state of visible to go back to initial state of 10 movies
  clearVisible = () => {
    this.setState({
      visible: 10,
      now: [],
      coming: [],
      top: []
    });
  };

  //https://codepen.io/grantdotlocal/pen/zReNgE
  loadMore = () => {
    this.setState(prev => {
      return { visible: prev.visible + 5 };
    });
  };

  //using !this.state.pageRefreshed so pageRefreshed would always be opposite of it, on every click
  refreshPage = () => {
    this.setState({
      pageRefreshed: !this.state.pageRefreshed
    });
  };

  addFavorite = movie => {
    const { favorite } = this.state;
    let copyFavorites = [...favorite];
    //if it doesnt include, add
    if (!favorite.includes(movie)) {
      copyFavorites.push(movie);
      this.setState({ favorite: copyFavorites });
      //if it includes, remove
      //https://stackoverflow.com/questions/5767325/how-do-i-remove-a-particular-element-from-an-array-in-javascript
    } else {
      copyFavorites = copyFavorites.filter(eachMovie => eachMovie !== movie);
      this.setState({ favorite: copyFavorites });
    }
  };

  render() {
    return (
      <MovieContext.Provider
        //these methods will be able to used by consumer after putting them here
        value={{
          ...this.state,
          getTrending: this.getTrending,
          getPopular: this.getPopular,
          getNow: this.getNow,
          getComing: this.getComing,
          getTop: this.getTop,
          handleClick: this.handleClick,
          handleSubmit: this.handleSubmit,
          handleChange: this.handleChange,
          searchMovie: this.searchMovie,
          openModal: this.openModal,
          closeModal: this.closeModal,
          clearSearch: this.clearSearch,
          loadMore: this.loadMore,
          cleanState: this.cleanState,
          clearVisible: this.clearVisible,
          refreshPage: this.refreshPage,
          updateMovieInfo: this.updateMovieInfo,
          addFavorite: this.addFavorite
        }}
      >
        {this.props.children}
        <Persist
          name="movies"
          data={this.state}
          debounce={500}
          onMount={data => this.setState(data)}
        />
      </MovieContext.Provider>
    );
  }
}

export default MovieContextProvider;
