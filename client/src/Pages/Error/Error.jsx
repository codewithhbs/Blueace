import React from 'react'
import { Link } from 'react-router-dom'
import MetaTag from '../../Components/Meta/MetaTag'

const Error = () => {
  return (
    <div>
      <MetaTag
        title="Page Not Found | Blueace Limited"
        description="The page you requested could not be found."
        robots="noindex, nofollow"
      />
      <section>
        <div className="container">

          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8 col-xl-6 text-center">

              <div className=""><img src="/assets/img/404.png" className="img-fluid" alt="404 - Page not found" /></div>

              <h1 className="mb-3 ft-bold">Whoops! That page doesn’t exist.</h1>

              <h5 className="ft-medium fs-md mb-5">The page you requested could not be found</h5>

              <Link className="btn rounded theme-bg text-light" to="/">Go To Home Page</Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

export default Error
