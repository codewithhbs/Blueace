import React from 'react'
import { Link } from 'react-router-dom'

const Breadcrumb = ({ heading, subHeading, LastHeading, backLink }) => {
    return (
        <div className="container-fluid">
            <div className="page-title">
                <div className="row">
                    <div className="col-sm-6 col-12">
                        <h2>{heading}</h2>
                    </div>
                    <div className="col-sm-6 col-12">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><a href="/"><i className="iconly-Home icli svg-color"></i></a></li>
                            <li className="breadcrumb-item"><Link to={backLink} >{subHeading}</Link></li>
                            <li className="breadcrumb-item active">{LastHeading}</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Breadcrumb
