import {HttpHandler} from "./HttpMessage";

export interface Filter {
    //takes "next" httpHandler and applies it after fn
    invoke(filter: (HttpHandler) => HttpHandler): (HttpHandler) => Filter
    then(filter: Filter): Filter
}